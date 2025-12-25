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

export default class PlansController {
  static async createPlan(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, price, durationValue, durationUnit } = req.body;

      if (!name || !price || !durationValue || !durationUnit) {
        errBadRequest(next, locale.payloadInvalid);
      }

      const newPlan = await prisma.plans.create({
        data: {
          name,
          price,
          durationValue: Number(durationValue),
          durationUnit,
        },
      });

      successRes(res, newPlan);
    } catch (error: any) {
      if (errorUnique(error)) {
        errBadRequest(next, error.message);
        return;
      }

      errInternalServer(next);
    }
  }

  static async getPlans(req: Request, res: Response, next: NextFunction) {
    try {
      const Plans = await prisma.plans.findMany();

      successRes(res, Plans);
    } catch (error: any) {
      if (errorValidation(error)) {
        errBadRequest(next, error.message);
        return;
      }

      errInternalServer(next);
    }
  }

  static async getPlan(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const Plan = await prisma.plans.findUnique({
        where: {
          id: Number(id),
        },
      });

      successRes(res, Plan);
    } catch (error: any) {
      if (errorValidation(error)) {
        errBadRequest(next, error.message);
        return;
      }

      errInternalServer(next);
    }
  }

  static async updatePlan(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { name, price, durationValue, durationUnit } = req.body;

      if (!name || !price || !durationValue || !durationUnit) {
        errBadRequest(next, locale.payloadInvalid);
      }

      const updatePlan = await prisma.plans.update({
        where: {
          id: Number(id),
        },
        data: {
          name,
          price: Number(price),
          durationValue: Number(durationValue),
          durationUnit,
        },
      });

      successRes(res, updatePlan);
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

  static async deletePlan(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      await prisma.plans.delete({
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
