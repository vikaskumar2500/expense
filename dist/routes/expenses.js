"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const expenses_1 = require("../controllers/expenses");
const router = express_1.default.Router();
router.post("/add-expense", expenses_1.postaddExpense);
exports.default = router;
//# sourceMappingURL=expenses.js.map