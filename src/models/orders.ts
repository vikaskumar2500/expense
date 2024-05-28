import Sequelize from "sequelize";
import { sequelize } from "../db";

export const Orders = sequelize.define("orders", {
  id: {
    type: Sequelize.STRING,
    allowNull: false,
    primaryKey: true,
    defaultValue:Sequelize.UUIDV4
  },
  paymentId: Sequelize.STRING,
  orderId: { type: Sequelize.STRING, allowNull: false },
  status: { type: Sequelize.STRING, allowNull: false },
})