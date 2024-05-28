import type { Request, Response } from "express";
import bcrypt from "bcrypt";
import { Users } from "../models/users";
import { sendEmailViaSMTP } from "../utils/send-email";
import { sequelize } from "../db";
import { ForgotPasswords } from "../models/forgot-password";

export const postForgotPassword = async (req: Request, res: Response) => {
  const otp = Math.floor(111111 + Math.random() * 999999).toString();
  const { email } = req.body;
  const t = await sequelize.transaction();

  try {
    const user = await Users.findOne<any>({ where: { email } });
    if (!user) throw new Error("User does not exist");

    await ForgotPasswords.create({ otp, userId: user.id }, { transaction: t });
    const smtpRes = await sendEmailViaSMTP(email, otp, user.id);

    console.log("smtpRes", smtpRes);
    if (smtpRes.status !== 200) throw new Error(smtpRes.error);

    await t.commit();
    return res.status(200).json({ message: "Email send successful" });
  } catch (e) {
    await t.rollback();
    return res.status(500).json({ message: e.message });
  }
};

export const postResetPassword = async (req: Request, res: Response) => {
  const t = await sequelize.transaction();

  try {
    const { userId } = req.params;
    const { otp, newPassword } = req.body;

    console.log(otp)
    // getting otp from forgot password table
    const forgotPassword = await ForgotPasswords.findOne<any>({
      where: {
        userId,
        isActive: true,
        otp,
      },
    });
    console.log(forgotPassword);
    if (!forgotPassword) throw new Error("Something went wrong!");

    // check for the password match
    if (forgotPassword.otp != otp) throw new Error("OTP does not match");

    // get current user
    const user = await Users.findByPk<any>(userId);

    // user does not found
    if (!user) throw new Error("User does not found!");

    const currentTime = Math.floor(new Date().getTime() / 1000);
    // setting time limit of 10 mins
    const timeDiff = currentTime - forgotPassword.forgottedAt;

    if (timeDiff > 10 * 60) {
      await ForgotPasswords.update(
        { isActive: false },
        { where: { id: forgotPassword.id } }
      );
      throw new Error("Timeout, please resend the otp and try again!");
    }

    const hashedPassword = await bcrypt.hash(
      newPassword,
      +process.env.AUTH_SALT!
    );

    await Users.update(
      { password: hashedPassword },
      {
        where: { id: userId },
        transaction: t,
      }
    );
    await ForgotPasswords.update(
      { isActive: false },
      { where: { id: forgotPassword.id }, transaction: t }
    );

    await t.commit();
    res.render("password/toast", {
      message: "Updated password!",
    });
    res.redirect(`/password/reset-password/${userId}`);
  } catch (e) {
    await t.rollback();
    res.render("password/toast", {
      message: e.message,
    });
    res.end();
  }
};

export const getResetPassword = (req: Request, res: Response) => {
  const userId = req.params.userId;
  res.render("password/reset-password", { userId });
};
