import { PrismaClient } from "@prisma/client";
import { NextFunction, Request, Response } from "express";
import {
  errBadRequest,
  errInternalServer,
  errorUnique,
  errorValidation,
  successRes,
} from "../utils";
import { locale } from "../locales";

const prisma = new PrismaClient();

export default class TransactionsController {
  static async createTransaction(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const {
        memberId,
        categoryId,
        description,
        category,
        type,
        amount,
        paymentMethod,
      } = req.body;

      if (!categoryId || !type || !amount || !paymentMethod) {
        errBadRequest(next, locale.payloadInvalid);
      }

      const newTransaction = await prisma.transactions.create({
        data: {
          memberId,
          categoryId,
          description,
          type,
          amount,
          paymentMethod,
          transactionDate: new Date(),
        },
      });

      successRes(res, newTransaction);
    } catch (error: any) {
      if (errorUnique(error)) {
        errBadRequest(next, error.message);
        return;
      }

      errInternalServer(next);
    }
  }

  static async getTransactions(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const transactions = await prisma.transactions.findMany({
        include: {
          category: {
            select: {
              name: true,
            },
          },
        },
      });

      successRes(res, transactions);
    } catch (error: any) {
      if (errorValidation(error)) {
        errBadRequest(next, error.message);
        return;
      }

      errInternalServer(next);
    }
  }

  static async getTransaction(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const transaction = await prisma.transactions.findUnique({
        where: {
          id: String(id),
        },
      });

      successRes(res, transaction);
    } catch (error: any) {
      if (errorValidation(error)) {
        errBadRequest(next, error.message);
        return;
      }

      errInternalServer(next);
    }
  }

  static async updateTransaction(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { id } = req.params;
      const { memberId, categoryId, description, type, amount, paymentMethod } =
        req.body;

      if (!categoryId || !type || !amount || !paymentMethod) {
        errBadRequest(next, locale.payloadInvalid);
      }

      const updateTransaction = await prisma.transactions.update({
        where: {
          id: String(id),
        },
        data: {
          memberId,
          categoryId,
          description,
          type,
          amount,
          paymentMethod,
        },
      });

      successRes(res, updateTransaction);
    } catch (error: any) {
      if (errorUnique(error)) {
        errBadRequest(next, error.message);
        return;
      }

      if (errorValidation(error)) {
        errBadRequest(next, error.message);
        return;
      }

      errInternalServer(next);
    }
  }

  static async deleteTransaction(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { id } = req.params;

      await prisma.transactions.delete({
        where: {
          id: String(id),
        },
      });

      successRes(res, locale.successfullyDeleted);
    } catch (error: any) {
      if (errorValidation(error)) {
        errBadRequest(next, error.message);
        return;
      }

      errInternalServer(next);
    }
  }
}
