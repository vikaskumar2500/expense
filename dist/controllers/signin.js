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
exports.postSignin = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const users_1 = require("../models/users");
const postSignin = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        const userRes = yield users_1.Users.findOne({ where: { email } });
        // console.log("headers", req.headers.authorization);
        // axios.defaults.headers.common["Authorization"] = "Vikas";
        // console.log("header",req);
        if (!userRes) {
            throw new Error("Failed to Login");
        }
        const hashedPassword = userRes.password;
        const typedPassword = password;
        const isMatched = yield bcrypt_1.default.compare(typedPassword, hashedPassword);
        if (!isMatched)
            return res.status(403).json({ message: "Password does not match!" });
        // req.user = userRes;
        return res.end();
    }
    catch (e) {
        return res.status(500).json({ message: e.message });
    }
});
exports.postSignin = postSignin;
//# sourceMappingURL=signin.js.map