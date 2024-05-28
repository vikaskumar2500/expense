"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sequelize = void 0;
const sequelize_1 = require("sequelize");
exports.sequelize = new sequelize_1.Sequelize("expense", "root", "vikas", {
    host: "localhost",
    dialect: "mysql",
});
// export const db = mysql.createPool({
//   database: "expense",
//   host: "localhost",
//   port: 3306,
//   password: "vikas",
//   user: "root",
// });
//# sourceMappingURL=db.js.map