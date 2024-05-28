"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.postaddExpense = void 0;
const expenses_1 = require("../models/expenses");
const postaddExpense = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log("headers", req.headers.authorization);
        const { amount, description, category } = req.body;
        yield expenses_1.Expenses.create({ amount, description, category });
        return res.status(200).json({ success: true });
    }
    catch (e) {
        console.log(e.message);
    }
});
exports.postaddExpense = postaddExpense;
//# sourceMappingURL=expenses.js.map