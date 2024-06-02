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
const dotenv_1 = __importDefault(require("dotenv"));
const expenses_1 = __importDefault(require("./routes/expenses"));
const users_1 = __importDefault(require("./routes/users"));
const premium_1 = __importDefault(require("./routes/premium"));
const password_1 = __importDefault(require("./routes/password"));
const users_2 = require("./models/users");
const expenses_2 = require("./models/expenses");
const orders_1 = require("./models/orders");
const forgot_password_1 = require("./models/forgot-password");
const path_1 = __importDefault(require("path"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const fs_1 = __importDefault(require("fs"));
// import https from "https";
dotenv_1.default.config();
const app = (0, express_1.default)();
// const privateKey = fs.readFileSync("server.key");
// const certificate = fs.readFileSync("server.cert");
app.use((0, cors_1.default)());
app.use(body_parser_1.default.json());
app.use(body_parser_1.default.urlencoded({ extended: true }));
app.use((0, cookie_parser_1.default)());
app.set("view engine", "ejs");
app.set("views", path_1.default.join(__dirname + "/views"));
app.use(express_1.default.static(path_1.default.join(__dirname + "public")));
app.use("/user", users_1.default);
app.use("/expenses", expenses_1.default);
app.use("/premium", premium_1.default);
app.use("/password", password_1.default);
app.use((req, res) => {
    console.log(req.url);
    res.sendFile(path_1.default.join(__dirname + `/public/${req.url}`));
});
const errorLogs = fs_1.default.createWriteStream(path_1.default.join(__dirname, "errors.log"), {
    flags: "a",
});
app.use((0, helmet_1.default)());
app.use((0, morgan_1.default)("combined", { stream: errorLogs }));
app.use((req, res) => {
    // res.render()
    res.end("HOME");
});
users_2.Users.hasMany(expenses_2.Expenses);
expenses_2.Expenses.belongsTo(users_2.Users, {
    constraints: true,
    onDelete: "CASCADE",
});
users_2.Users.hasOne(orders_1.Orders, { onDelete: "CASCADE", constraints: true });
orders_1.Orders.belongsTo(users_2.Users);
users_2.Users.hasMany(forgot_password_1.ForgotPasswords, { onDelete: "CASCADE", constraints: true });
forgot_password_1.ForgotPasswords.belongsTo(users_2.Users, { constraints: true, onDelete: "CASCADE" });
db_1.sequelize
    .sync()
    .then(() => {
    // https
    //   .createServer({ key: privateKey, cert: certificate }, app)
    //   .listen(process.env.PORT || 3000, () => {
    //     console.log(`Running server on ${process.env.PORT || 3000}`);
    //   });
    app.listen(3000, () => {
        console.log("Server is running at port of 3000");
    });
})
    .catch((e) => {
    console.log(e);
});
//# sourceMappingURL=app.js.map