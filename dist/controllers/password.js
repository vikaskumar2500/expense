"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.postResetPassword = exports.postForgotPassword = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const users_1 = require("../models/users");
const send_email_1 = require("../utils/send-email");
const db_1 = require("../db");
const forgot_password_1 = require("../models/forgot-password");
const decode_token_1 = require("../utils/decode-token");
const postForgotPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const otp = Math.floor(111111 + Math.random() * 999999).toString();
    const { email } = req.body;
    const t = yield db_1.sequelize.transaction();
    try {
        const user = yield users_1.Users.findOne({ where: { email } });
        if (!user)
            throw new Error("User does not exist");
        yield forgot_password_1.ForgotPasswords.create({ otp, userId: user.id }, { transaction: t });
        const smtpRes = yield (0, send_email_1.sendEmailViaSMTP)(email, otp, user.id);
        if (smtpRes.status !== 200)
            throw new Error(smtpRes.error);
        yield t.commit();
        return res.status(200).json({ message: "Email send successful" });
    }
    catch (e) {
        yield t.rollback();
        return res.status(500).json({ message: e.message });
    }
});
exports.postForgotPassword = postForgotPassword;
const postResetPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const t = yield db_1.sequelize.transaction();
    try {
        const token = req.headers["authorization"];
        const { id } = (0, decode_token_1.decodeToken)(token);
        const { otp, newPassword } = req.body;
        // getting otp from forgot password table
        const forgotPassword = yield forgot_password_1.ForgotPasswords.findOne({
            where: {
                userId: id,
                isActive: true,
                otp,
            },
        });
        if (!forgotPassword)
            throw new Error("Something went wrong!");
        // check for the password match
        if (forgotPassword.otp != otp)
            throw new Error("OTP does not match");
        // get current user
        const user = yield users_1.Users.findByPk(id);
        // user does not found
        if (!user)
            throw new Error("User does not found!");
        const currentTime = Math.floor(new Date().getTime() / 1000);
        // setting time limit of 10 mins
        const timeDiff = currentTime - forgotPassword.forgottedAt;
        if (timeDiff > 10 * 60) {
            yield forgot_password_1.ForgotPasswords.update({ isActive: false }, { where: { id: forgotPassword.id } });
            throw new Error("Timeout, please resend the otp and try again!");
        }
        const hashedPassword = yield bcrypt_1.default.hash(newPassword, +process.env.AUTH_SALT);
        yield users_1.Users.update({ password: hashedPassword }, {
            where: { id },
            transaction: t,
        });
        yield forgot_password_1.ForgotPasswords.update({ isActive: false }, { where: { id: forgotPassword.id }, transaction: t });
        yield t.commit();
        res.status(200).json({ message: "Password updated succesfully!" });
    }
    catch (e) {
        yield t.rollback();
        res.status(500).json({ message: e.message });
    }
});
exports.postResetPassword = postResetPassword;
//# sourceMappingURL=password.js.map