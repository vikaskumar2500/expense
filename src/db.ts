import { Sequelize } from "sequelize";
import dot from "dotenv";

dot.config();

export const sequelize = new Sequelize(
  process.env.DATABASE_NAME,
  process.env.DATABASE_USERNAME,
  process.env.DATABASE_PASSWORD,
  {
    host: process.env.DATABASE_HOST,
    port: +process.env.DATABASE_PORT,
    dialect: "mysql",
  }
);
// export const db = mysql.createPool({
//   database: ,
//   host: ,
//   port: ,
//   password: ,
//   user:,
// });
