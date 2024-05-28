import express from "express";
import {
  getExpenses,
  postaddExpense,
  createOrders,
  postPaymentCaptured,
  postPaymentFailed,
  postDeleteExpense,
  getDownloadExpense,
  getS3BucketData,
} from "../controllers/expenses";

const router = express.Router();

router.get("/", getExpenses);
router.post("/orders", createOrders);
router.post("/add-expense", postaddExpense);
router.post("/payment-captured", postPaymentCaptured);
router.post("/payment-failed", postPaymentFailed);
router.post("/delete/:expenseId", postDeleteExpense);
router.get("/download", getDownloadExpense);
router.get("/s3", getS3BucketData);

export default router;
