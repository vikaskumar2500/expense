import Sequelize from "sequelize";
import { sequelize } from "../db";

export const Users = sequelize.define("users", {
  id: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true,
    primaryKey: true,
    defaultValue:Sequelize.UUIDV4
  },
  name: { type: Sequelize.STRING, allowNull: false },
  email: { type: Sequelize.STRING, allowNull: false, unique: true },
  password: { type: Sequelize.TEXT, allowNull: false },
  isPremium: { type: Sequelize.BOOLEAN, defaultValue: false },
  total_expenses: { type: Sequelize.INTEGER, defaultValue: 0 },
});

