"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ForgotPasswords = void 0;
const sequelize_1 = __importDefault(require("sequelize"));
const db_1 = require("../db");
exports.ForgotPasswords = db_1.sequelize.define("forgotpasswords", {
    id: {
        type: sequelize_1.default.STRING,
        allowNull: false,
        unique: true,
        primaryKey: true,
        defaultValue: sequelize_1.default.UUIDV4,
    },
    otp: { type: sequelize_1.default.STRING, allowNull: false },
    isActive: { type: sequelize_1.default.BOOLEAN, defaultValue: true },
    forgottedAt: {
        type: sequelize_1.default.INTEGER,
        defaultValue: Math.floor(new Date().getTime() / 1000),
    },
}, { timestamps: false });
//# sourceMappingURL=forgot-password.js.map