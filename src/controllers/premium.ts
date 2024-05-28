import { Request, Response } from "express";
import { decodeToken } from "../utils/decode-token";
import { Users } from "../models/users";

export const getShowLeaderboard = async (req: Request, res: Response) => {
  try {
    const token = req.headers["authorization"];
    const user = decodeToken(token);
    console.log("user", user);
    if (!user) return res.status(403).json({ message: "UnAuthorized user" });

    const totalExpenses = await Users.findAll({
      attributes: ["id", "name", "total_expenses"],
      order: [["total_expenses", "DESC"]],
    });
    return res.status(200).json(totalExpenses);
  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
};

export const getIsPremium = async (req: Request, res: Response) => {
  try {
    const token = req.headers["authorization"];
    const user = decodeToken(token);
    if (!user) throw new Error("UnAuthorized user");

    const userData: any = await Users.findByPk(user.id);
    return res.status(200).json(userData.isPremium);
  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
};
