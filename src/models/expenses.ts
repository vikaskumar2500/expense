import Sequelize from "sequelize";
import { sequelize } from "../db";

export const Expenses = sequelize.define("expenses", {
  id: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true,
    primaryKey: true,
    defaultValue:Sequelize.UUIDV4
  },
  amount: { type: Sequelize.INTEGER, allowNull: false },
  description: { type: Sequelize.TEXT, allowNull: false },
  category: { type: Sequelize.STRING, allowNull: false },
});
