import express from "express";
import {
  getResetPassword,
  postForgotPassword,
  postResetPassword,
} from "../controllers/password";

const router = express.Router();

router.post("/forgot-password", postForgotPassword);
router.post("/reset-password/:userId", postResetPassword);
router.get("/reset-password/:userId", getResetPassword);

export default router;
