"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const premium_1 = require("../controllers/premium");
const router = express_1.default.Router();
router.get("/show-leaderboard", premium_1.getShowLeaderboard);
router.get("/is-premium", premium_1.getIsPremium);
exports.default = router;
//# sourceMappingURL=premium.js.map