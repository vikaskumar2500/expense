"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const expenses_1 = require("../controllers/expenses");
const router = express_1.default.Router();
router.get("/", expenses_1.getExpenses);
router.post("/orders", expenses_1.createOrders);
router.post("/add-expense", expenses_1.postaddExpense);
router.post("/payment-captured", expenses_1.postPaymentCaptured);
router.post("/payment-failed", expenses_1.postPaymentFailed);
router.post("/delete/:expenseId", expenses_1.postDeleteExpense);
router.get("/download", expenses_1.getDownloadExpense);
router.get("/s3", expenses_1.getS3BucketData);
exports.default = router;
//# sourceMappingURL=expenses.js.map