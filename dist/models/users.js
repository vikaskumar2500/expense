"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Users = void 0;
const sequelize_1 = __importDefault(require("sequelize"));
const db_1 = require("../db");
exports.Users = db_1.sequelize.define("users", {
    id: {
        type: sequelize_1.default.STRING,
        allowNull: false,
        unique: true,
        primaryKey: true,
        defaultValue: sequelize_1.default.UUIDV4
    },
    name: { type: sequelize_1.default.STRING, allowNull: false },
    email: { type: sequelize_1.default.STRING, allowNull: false, unique: true },
    password: { type: sequelize_1.default.TEXT, allowNull: false },
    isPremium: { type: sequelize_1.default.BOOLEAN, defaultValue: false },
    total_expenses: { type: sequelize_1.default.INTEGER, defaultValue: 0 },
});
//# sourceMappingURL=users.js.map