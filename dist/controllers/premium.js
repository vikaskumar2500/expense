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
exports.getIsPremium = exports.getShowLeaderboard = void 0;
const decode_token_1 = require("../utils/decode-token");
const users_1 = require("../models/users");
const getShowLeaderboard = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const token = req.headers["authorization"];
        const user = (0, decode_token_1.decodeToken)(token);
        if (!user)
            return res.status(403).json({ message: "UnAuthorized user" });
        const totalExpenses = yield users_1.Users.findAll({
            attributes: ["id", "name", "total_expenses"],
            order: [["total_expenses", "DESC"]],
        });
        return res.status(200).json(totalExpenses);
    }
    catch (e) {
        return res.status(500).json({ message: e.message });
    }
});
exports.getShowLeaderboard = getShowLeaderboard;
const getIsPremium = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const token = req.headers["authorization"];
        const user = (0, decode_token_1.decodeToken)(token);
        if (!user)
            throw new Error("UnAuthorized user");
        const userData = yield users_1.Users.findByPk(user.id);
        return res.status(200).json({ isPremium: userData.isPremium });
    }
    catch (e) {
        return res.status(500).json({ message: e.message });
    }
});
exports.getIsPremium = getIsPremium;
//# sourceMappingURL=premium.js.map