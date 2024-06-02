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
exports.sendEmailViaSMTP = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const sendEmailViaSMTP = (email, otp, userId) => __awaiter(void 0, void 0, void 0, function* () {
    const transporter = nodemailer_1.default.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: {
            user: "vikas.nits8084@gmail.com",
            pass: process.env.NODEMAILER_PASSWORD,
        },
    });
    try {
        const res = yield transporter.sendMail({
            from: "vikas.nits8084@gmail.com",
            to: email,
            subject: "Reset your password!",
            html: `<div style={{display:"flex", alignItems:"center", flexDirection:"column", padding:"10px", gap:"5px"}}>
        <span>Your verification code:${otp} for expense tracker app </span>
        <a href='http://13.235.103.61:3000/password/reset-password.html'>
          Reset your password
        </a>
        <div>NOTE: Please do not share this otp with anyone!</div>
        </div>
        `,
        });
        return {
            status: 200,
            body: res,
        };
    }
    catch (e) {
        return {
            status: 500,
            error: e.message,
        };
    }
});
exports.sendEmailViaSMTP = sendEmailViaSMTP;
//# sourceMappingURL=send-email.js.map