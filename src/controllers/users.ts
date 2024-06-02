import bcrypt from "bcrypt";
import { Users } from "../models/users";
import type { Request, Response } from "express";
import * as jwt from "jsonwebtoken";

export const postSignup = async (req: Request, res: Response) => {
  const { password, email, name } = req.body;
  const hashedPassword = await bcrypt.hash(password, +process.env.AUTH_SALT!);
  try {
    const respose = await Users.create({
      name,
      email,
      password: hashedPassword,
    });
    return res.status(200).json(respose);
  } catch (e: any) {
    res.status(500).json({ message: e.message });
  }
};

export const postSignin = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const userRes = await Users.findOne<any>({ where: { email } });
    if (!userRes) {
      throw new Error("Failed to Login");
    }
    const hashedPassword = userRes.password;
    const typedPassword = password;
    const isMatched = await bcrypt.compare(typedPassword, hashedPassword);
    if (!isMatched)
      return res.status(403).json({ message: "Password does not match!" });
    const authToken = jwt.sign(
      { id: userRes.id, email: userRes.email, name: userRes.name },
      process.env.SECRET_KEY!,
      { algorithm: "HS256" }
    );
    return res.status(200).json({ token: authToken });
  } catch (e: any) {
    return res.status(500).json({ message: e.message });
  }
};

