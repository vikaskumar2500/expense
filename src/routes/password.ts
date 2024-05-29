import express from "express";
import {
  postForgotPassword, 
  postResetPassword,
} from "../controllers/password";

const router = express.Router();

router.post("/forgot-password", postForgotPassword);
router.post("/reset-password", postResetPassword);

export default router; 
