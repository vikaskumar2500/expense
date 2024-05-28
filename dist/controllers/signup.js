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
exports.postSignup = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const users_1 = require("../models/users");
const postSignup = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { password, email, name } = req.body;
    const hashedPassword = yield bcrypt_1.default.hash(password, +process.env.AUTH_SALT);
    try {
        const respose = yield users_1.Users.create({
            name,
            email,
            password: hashedPassword,
        });
        return res.status(200).json(respose);
    }
    catch (e) {
        console.log("message", e.message);
        res.status(500).json({ success: false, message: e.message });
    }
});
exports.postSignup = postSignup;
//# sourceMappingURL=signup.js.map