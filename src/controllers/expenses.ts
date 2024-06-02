import { Expenses } from "../models/expenses";
import { Request, Response } from "express";
import * as jwt from "jsonwebtoken";
import { decodeToken } from "../utils/decode-token";
import Razorpay from "razorpay";
import { Orders } from "../models/orders";
import { Users } from "../models/users";
import { sequelize } from "../db";
import { s3GetService, s3PutService } from "../sources/s3-service";
import { currentDate } from "../utils/current-date";

export interface User {
  id: string;
  email: string;
  name: string;
  isPremium: boolean;
}

export const getExpenses = async (req: Request, res: Response) => {
  try {
    const user = decodeToken(req.headers["authorization"]) as User;
    if (!user) return res.status(403).json({ message: "UnAuthorized user" });

    const page = +req.query.page;
    const limit = +req.query.limit;
    const totalCount = await Expenses.count({ where: { userId: user.id } });
    const expenses = await Expenses.findAll({
      where: { userId: user.id },
      limit: limit,
      offset: (page - 1) * limit,
    });

    return res.status(200).json({
      expenses,
      pagination: {
        next: page + 1,
        prev: page - 1,
        hasPrev: page > 1,
        hasNext: limit * page < totalCount,
        curr: page,
        last: Math.ceil(totalCount / limit),
      },
    });
  } catch (e) {
    console.log("e", e);
    return res.status(500).json({ message: e.message });
  }
};

export const getS3BucketData = async (req: Request, res: Response) => {
  try {
    const token = req.headers["authorization"];
    const user = decodeToken(token);
    if (!user) throw new Error("UnAuthorized user");

    const userData: any = await Users.findByPk(user.id);

    if (!userData.isPremium)
      throw new Error("Oops!, You are not a premium user");

    const bucketData = await s3GetService({
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Prefix: `${user.id}`,
    });
    return res.status(200).json({ s3Data: bucketData });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const postaddExpense = async (req: Request, res: Response) => {
  const t = await sequelize.transaction();
  try {
    const { amount, description, category, token } = req.body;
    const user = jwt.verify(token, process.env.SECRET_KEY) as User;

    if (!user) throw new Error("Something went wrong, please login again!");
    const updatedUser: any = await Users.findByPk(user.id);
    await Users.update(
      { total_expenses: updatedUser.total_expenses + Number(amount) },
      { where: { id: user.id }, transaction: t }
    );
    const addedExpense: any = await Expenses.create(
      { amount, description, category, userId: user.id },
      { transaction: t }
    );
    await t.commit();
    return res
      .status(200)
      .json({ message: "Expenses created!", expenseId: addedExpense.id });
  } catch (e) {
    await t.rollback();
    return res.status(500).json({ message: e.message });
  }
};

export const createOrders = async (req: Request, res: Response) => {
  try {
    const token = req.body.token;
    const user = decodeToken(token) as User;
    if (!user) return res.status(403).json({ message: "UnAuthorized user" });

    const params = {
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SCERET,
    };
    const rzp = new Razorpay(params);
    const amount = 2500;
    rzp.orders.create({ amount, currency: "INR" }, async (e, orders) => {
      if (e) {
        return res
          .status(e.statusCode as number)
          .json({ messsage: e.error.description });
      }
      await Orders.create({
        paymentId: "",
        orderId: orders.id,
        status: "pending",
        userId: user.id,
      });
      return res.status(200).json({ keyId: params.key_id, orderId: orders.id });
    });
  } catch (e) {
    console.log("message", e.message);
    return res.status(500).json({ message: e.message });
  }
};

export const postPaymentCaptured = async (req: Request, res: Response) => {
  const t = await sequelize.transaction();
  try {
    const token = req.body.token;
    const user = decodeToken(token);
    if (!user) throw new Error("UnAuthorized user");

    const updatedOrder = await Orders.update(
      {
        paymentId: req.body.paymentId,
        status: "Successful",
      },
      {
        where: {
          orderId: req.body.orderId,
          userId: user.id,
        },
        transaction: t,
      }
    );
    await Users.update(
      { isPremium: true },
      { where: { id: user.id }, transaction: t }
    );
    await t.commit();
    return res.status(200).json(updatedOrder);
  } catch (e) {
    console.log(e);
    await t.rollback();
    return res.status(500).json({ message: e.message });
  }
};

export const postPaymentFailed = async (req: Request, res: Response) => {
  try {
    const token = req.body.token;
    const user = decodeToken(token);
    if (!user) throw new Error("UnAuthorized user");

    await Orders.update(
      {
        status: "Failed",
      },
      {
        where: {
          orderId: req.body.orderId,
          userId: user.id,
        },
      }
    );
    return res.status(200).json({ message: "Payment failed!" });
  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
};

export const postDeleteExpense = async (req: Request, res: Response) => {
  const t = await sequelize.transaction();

  try {
    const token = req.body.token;
    const user = decodeToken(token);

    if (!user) throw new Error("UnAuthorized user");
    const { expenseId } = req.params;

    const expenseData: any = await Expenses.findByPk(expenseId);

    await Expenses.destroy({ where: { id: expenseId }, transaction: t });

    await Users.decrement("total_expenses", {
      by: expenseData.amount,
      transaction: t,
      where: { id: user.id },
    });

    await t.commit();
    return res.status(200).json({});
  } catch (e) {
    console.log(e);
    await t.rollback();
    return res.status(500).json({ message: e.message });
  }
};

export const getDownloadExpense = async (req: Request, res: Response) => {
  try {
    const token = req.headers["authorization"];

    const user = decodeToken(token);

    if (!user) throw new Error("UnAuthorized user");

    const expenses: any[] = await Expenses.findAll({
      where: { userId: user.id },
    });

    let csvFile = "Id,Amount,Description,Category,CreatedAt,UpdatedAt,UserId\n";
    for (let i = 0; i < expenses.length; i++) {
      csvFile += `${expenses[i].id},${expenses[i].amount},"${expenses[i].description}","${expenses[i].category}",${expenses[i].createdAt},${expenses[i].updatedAt},${expenses[i].userId}\n`;
    }

    const Key = `${user.id}/expenses-${currentDate()}.csv`;

    await s3PutService({
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key,
      Body: csvFile,
      ContentType: "text/csv;charset=utf-8",
      ACL: "public-read",
    });

    return res.status(200).json({
      url: `${process.env.AWS_S3_END_POINT}/${Key}`,
      userId: user.id,
      Key,
      date: currentDate(),
    });
  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
};
