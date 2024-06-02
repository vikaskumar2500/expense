"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const password_1 = require("../controllers/password");
const router = express_1.default.Router();
router.post("/forgot-password", password_1.postForgotPassword);
router.post("/reset-password", password_1.postResetPassword);
exports.default = router;
//# sourceMappingURL=password.js.map