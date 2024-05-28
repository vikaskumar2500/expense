import express from "express";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import cors from "cors";
import { sequelize } from "./db";
import dotenv from "dotenv";
import expenseRouter from "./routes/expenses";
import usersRouter from "./routes/users";
import premiumRouter from "./routes/premium";
import passwordRouter from "./routes/password";
import { Users } from "./models/users";
import { Expenses } from "./models/expenses";
import { Orders } from "./models/orders";
import { ForgotPasswords } from "./models/forgot-password";
import path from "path";
import helmet from "helmet";
import morgan from "morgan";
import fs from "fs";
// import https from "https";

dotenv.config();

const app = express();

// const privateKey = fs.readFileSync("server.key");
// const certificate = fs.readFileSync("server.cert");

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.set("view engine", "ejs");
app.set("views", path.join(__dirname + "/views"));

app.use("/user", usersRouter);
app.use("/expenses", expenseRouter);
app.use("/premium", premiumRouter);
app.use("/password", passwordRouter);

app.use("/", (req, res) => {
  res.send(`
    <body>
      <div>Home</div>
    </body>
  `);
});

const errorLogs = fs.createWriteStream(path.join(__dirname, "errors.log"), {
  flags: "a",
});

app.use(helmet());
app.use(morgan("combined", { stream: errorLogs }));

Users.hasMany(Expenses);
Expenses.belongsTo(Users, {
  constraints: true,
  onDelete: "CASCADE",
});

Users.hasOne(Orders, { onDelete: "CASCADE", constraints: true });
Orders.belongsTo(Users);

Users.hasMany(ForgotPasswords, { onDelete: "CASCADE", constraints: true });
ForgotPasswords.belongsTo(Users, { constraints: true, onDelete: "CASCADE" });

sequelize
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
