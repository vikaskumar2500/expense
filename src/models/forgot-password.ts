import Sequelize, { CreationOptional } from "sequelize";
import { sequelize } from "../db";

export const ForgotPasswords = sequelize.define(
  "forgotpasswords",
  {
    id: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
      primaryKey: true,
      defaultValue: Sequelize.UUIDV4,
    },
    otp: { type: Sequelize.STRING, allowNull: false },
    isActive: { type: Sequelize.BOOLEAN, defaultValue: true },
    forgottedAt: {
      type: Sequelize.INTEGER,
      defaultValue: Math.floor(new Date().getTime() / 1000),
    },
  },
  { timestamps: false }
);
