"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
const db_1 = require("./db");
const users_1 = require("./models/users");
const expenses_1 = require("./models/expenses");
const dotenv_1 = __importDefault(require("dotenv"));
const expenses_2 = __importDefault(require("./routes/expenses"));
const users_2 = __importDefault(require("./routes/users"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(body_parser_1.default.json());
app.use(body_parser_1.default.urlencoded({ extended: true }));
app.use((0, cookie_parser_1.default)());
app.use("/user", users_2.default);
app.use("/expenses", expenses_2.default);
app.use("/", (req, res) => {
    res.send(`
    <body>
      <div>Home</div>
    </body>
  `);
});
users_1.Users.hasMany(expenses_1.Expenses);
expenses_1.Expenses.belongsTo(users_1.Users, {
    constraints: true,
    onDelete: "CASCADE",
});
db_1.sequelize
    .sync({ force: true })
    .then(() => {
    app.listen(3000, () => {
        console.log("Server is running at port of 3000");
    });
})
    .catch((e) => {
    console.log(e);
});
//# sourceMappingURL=app.js.map