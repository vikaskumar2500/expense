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
exports.getDownloadExpense = exports.postDeleteExpense = exports.postPaymentFailed = exports.postPaymentCaptured = exports.createOrders = exports.postaddExpense = exports.getS3BucketData = exports.getExpenses = void 0;
const expenses_1 = require("../models/expenses");
const jwt = __importStar(require("jsonwebtoken"));
const decode_token_1 = require("../utils/decode-token");
const razorpay_1 = __importDefault(require("razorpay"));
const orders_1 = require("../models/orders");
const users_1 = require("../models/users");
const db_1 = require("../db");
const s3_service_1 = require("../sources/s3-service");
const current_date_1 = require("../utils/current-date");
const getExpenses = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = (0, decode_token_1.decodeToken)(req.headers["authorization"]);
        if (!user)
            return res.status(403).json({ message: "UnAuthorized user" });
        const page = +req.query.page;
        const limit = +req.query.limit;
        const totalCount = yield expenses_1.Expenses.count({ where: { userId: user.id } });
        const expenses = yield expenses_1.Expenses.findAll({
            where: { userId: user.id },
            limit: limit,
            offset: (page - 1) * limit,
        });
        return res.status(200).json({
            expenses,
            pagination: {
                next: page + 1,
                prev: page - 1,
                hasPrev: page > 1,
                hasNext: limit * page < totalCount,
                curr: page,
                last: Math.ceil(totalCount / limit),
            },
        });
    }
    catch (e) {
        console.log("e", e);
        return res.status(500).json({ message: e.message });
    }
});
exports.getExpenses = getExpenses;
const getS3BucketData = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const token = req.headers["authorization"];
        const user = (0, decode_token_1.decodeToken)(token);
        if (!user)
            throw new Error("UnAuthorized user");
        const userData = yield users_1.Users.findByPk(user.id);
        if (!userData.isPremium)
            throw new Error("Oops!, You are not a premium user");
        const bucketData = yield (0, s3_service_1.s3GetService)({
            Bucket: process.env.AWS_S3_BUCKET_NAME,
            Prefix: `${user.id}`,
        });
        return res.status(200).json({ s3Data: bucketData });
    }
    catch (e) {
        res.status(500).json({ message: e.message });
    }
});
exports.getS3BucketData = getS3BucketData;
const postaddExpense = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const t = yield db_1.sequelize.transaction();
    try {
        const { amount, description, category, token } = req.body;
        const user = jwt.verify(token, process.env.SECRET_KEY);
        if (!user)
            throw new Error("Something went wrong, please login again!");
        const updatedUser = yield users_1.Users.findByPk(user.id);
        yield users_1.Users.update({ total_expenses: updatedUser.total_expenses + Number(amount) }, { where: { id: user.id }, transaction: t });
        const addedExpense = yield expenses_1.Expenses.create({ amount, description, category, userId: user.id }, { transaction: t });
        yield t.commit();
        return res
            .status(200)
            .json({ message: "Expenses created!", expenseId: addedExpense.id });
    }
    catch (e) {
        yield t.rollback();
        return res.status(500).json({ message: e.message });
    }
});
exports.postaddExpense = postaddExpense;
const createOrders = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const token = req.body.token;
        const user = (0, decode_token_1.decodeToken)(token);
        if (!user)
            return res.status(403).json({ message: "UnAuthorized user" });
        const params = {
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SCERET,
        };
        const rzp = new razorpay_1.default(params);
        const amount = 2500;
        rzp.orders.create({ amount, currency: "INR" }, (e, orders) => __awaiter(void 0, void 0, void 0, function* () {
            if (e) {
                return res
                    .status(e.statusCode)
                    .json({ messsage: e.error.description });
            }
            yield orders_1.Orders.create({
                paymentId: "",
                orderId: orders.id,
                status: "pending",
                userId: user.id,
            });
            return res.status(200).json({ keyId: params.key_id, orderId: orders.id });
        }));
    }
    catch (e) {
        console.log("message", e.message);
        return res.status(500).json({ message: e.message });
    }
});
exports.createOrders = createOrders;
const postPaymentCaptured = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const t = yield db_1.sequelize.transaction();
    try {
        const token = req.body.token;
        const user = (0, decode_token_1.decodeToken)(token);
        if (!user)
            throw new Error("UnAuthorized user");
        const updatedOrder = yield orders_1.Orders.update({
            paymentId: req.body.paymentId,
            status: "Successful",
        }, {
            where: {
                orderId: req.body.orderId,
                userId: user.id,
            },
            transaction: t,
        });
        yield users_1.Users.update({ isPremium: true }, { where: { id: user.id }, transaction: t });
        yield t.commit();
        return res.status(200).json(updatedOrder);
    }
    catch (e) {
        console.log(e);
        yield t.rollback();
        return res.status(500).json({ message: e.message });
    }
});
exports.postPaymentCaptured = postPaymentCaptured;
const postPaymentFailed = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const token = req.body.token;
        const user = (0, decode_token_1.decodeToken)(token);
        if (!user)
            throw new Error("UnAuthorized user");
        yield orders_1.Orders.update({
            status: "Failed",
        }, {
            where: {
                orderId: req.body.orderId,
                userId: user.id,
            },
        });
        return res.status(200).json({ message: "Payment failed!" });
    }
    catch (e) {
        return res.status(500).json({ message: e.message });
    }
});
exports.postPaymentFailed = postPaymentFailed;
const postDeleteExpense = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const t = yield db_1.sequelize.transaction();
    try {
        const token = req.body.token;
        const user = (0, decode_token_1.decodeToken)(token);
        if (!user)
            throw new Error("UnAuthorized user");
        const { expenseId } = req.params;
        const expenseData = yield expenses_1.Expenses.findByPk(expenseId);
        yield expenses_1.Expenses.destroy({ where: { id: expenseId }, transaction: t });
        yield users_1.Users.decrement("total_expenses", {
            by: expenseData.amount,
            transaction: t,
            where: { id: user.id },
        });
        yield t.commit();
        return res.status(200).json({});
    }
    catch (e) {
        console.log(e);
        yield t.rollback();
        return res.status(500).json({ message: e.message });
    }
});
exports.postDeleteExpense = postDeleteExpense;
const getDownloadExpense = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const token = req.headers["authorization"];
        const user = (0, decode_token_1.decodeToken)(token);
        if (!user)
            throw new Error("UnAuthorized user");
        const expenses = yield expenses_1.Expenses.findAll({
            where: { userId: user.id },
        });
        let csvFile = "Id,Amount,Description,Category,CreatedAt,UpdatedAt,UserId\n";
        for (let i = 0; i < expenses.length; i++) {
            csvFile += `${expenses[i].id},${expenses[i].amount},"${expenses[i].description}","${expenses[i].category}",${expenses[i].createdAt},${expenses[i].updatedAt},${expenses[i].userId}\n`;
        }
        const Key = `${user.id}/expenses-${(0, current_date_1.currentDate)()}.csv`;
        yield (0, s3_service_1.s3PutService)({
            Bucket: process.env.AWS_S3_BUCKET_NAME,
            Key,
            Body: csvFile,
            ContentType: "text/csv;charset=utf-8",
            ACL: "public-read",
        });
        return res.status(200).json({
            url: `${process.env.AWS_S3_END_POINT}/${Key}`,
            userId: user.id,
            Key,
            date: (0, current_date_1.currentDate)(),
        });
    }
    catch (e) {
        return res.status(500).json({ message: e.message });
    }
});
exports.getDownloadExpense = getDownloadExpense;
//# sourceMappingURL=expenses.js.map