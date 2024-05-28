"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Expenses = void 0;
const sequelize_1 = __importDefault(require("sequelize"));
const db_1 = require("../db");
exports.Expenses = db_1.sequelize.define("expenses", {
    id: {
        type: sequelize_1.default.INTEGER,
        allowNull: false,
        unique: true,
        primaryKey: true,
        autoIncrement: true,
    },
    amount: { type: sequelize_1.default.INTEGER, allowNull: false },
    description: { type: sequelize_1.default.TEXT, allowNull: false },
    category: { type: sequelize_1.default.STRING, allowNull: false },
});
//# sourceMappingURL=expenses.js.map