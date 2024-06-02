"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Orders = void 0;
const sequelize_1 = __importDefault(require("sequelize"));
const db_1 = require("../db");
exports.Orders = db_1.sequelize.define("orders", {
    id: {
        type: sequelize_1.default.STRING,
        allowNull: false,
        primaryKey: true,
        defaultValue: sequelize_1.default.UUIDV4
    },
    paymentId: sequelize_1.default.STRING,
    orderId: { type: sequelize_1.default.STRING, allowNull: false },
    status: { type: sequelize_1.default.STRING, allowNull: false },
});
//# sourceMappingURL=orders.js.map