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

export default class CategoriesController {
  static async createCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, description } = req.body;

      if (!name || !description) {
        errBadRequest(next, locale.payloadInvalid);
      }

      const newCategory = await prisma.categories.create({
        data: {
          name,
          description,
        },
      });

      successRes(res, newCategory);
    } catch (error: any) {
      if (errorUnique(error)) {
        errBadRequest(next, error.message);
        return;
      }

      errInternalServer(next);
    }
  }

  static async getCategories(req: Request, res: Response, next: NextFunction) {
    try {
      const categories = await prisma.categories.findMany();

      successRes(res, categories);
    } catch (error: any) {
      if (errorValidation(error)) {
        errBadRequest(next, error.message);
        return;
      }

      errInternalServer(next);
    }
  }

  static async getCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const Category = await prisma.categories.findUnique({
        where: {
          id: Number(id),
        },
      });

      successRes(res, Category);
    } catch (error: any) {
      if (errorValidation(error)) {
        errBadRequest(next, error.message);
        return;
      }

      errInternalServer(next);
    }
  }

  static async updateCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { name, description } = req.body;

      if (!name || !description) {
        errBadRequest(next, locale.payloadInvalid);
      }

      const updateCategory = await prisma.categories.update({
        where: {
          id: Number(id),
        },
        data: {
          name,
          description
        },
      });

      successRes(res, updateCategory);
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

  static async deleteCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      await prisma.categories.delete({
        where: {
          id: Number(id),
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
