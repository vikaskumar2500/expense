"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
exports.postSignin = exports.postSignup = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const users_1 = require("../models/users");
const jwt = __importStar(require("jsonwebtoken"));
const postSignup = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        res.status(500).json({ message: e.message });
    }
});
exports.postSignup = postSignup;
const postSignin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        const userRes = yield users_1.Users.findOne({ where: { email } });
        if (!userRes) {
            throw new Error("Failed to Login");
        }
        const hashedPassword = userRes.password;
        const typedPassword = password;
        const isMatched = yield bcrypt_1.default.compare(typedPassword, hashedPassword);
        if (!isMatched)
            return res.status(403).json({ message: "Password does not match!" });
        const authToken = jwt.sign({ id: userRes.id, email: userRes.email, name: userRes.name }, process.env.SECRET_KEY, { algorithm: "HS256" });
        return res.status(200).json({ token: authToken });
    }
    catch (e) {
        return res.status(500).json({ message: e.message });
    }
});
exports.postSignin = postSignin;
//# sourceMappingURL=users.js.map