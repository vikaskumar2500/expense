import express from "express";
import { getIsPremium, getShowLeaderboard } from "../controllers/premium";

const router = express.Router();

router.get("/show-leaderboard", getShowLeaderboard);
router.get("/is-premium", getIsPremium);

export default router;                                                         




