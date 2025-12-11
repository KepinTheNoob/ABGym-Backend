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

export default class AttendancesController {
  static async createAttendance(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { memberId, checkInTime, checkOutTime } = req.body;

      if (!memberId || !checkInTime) {
        errBadRequest(next, locale.payloadInvalid);
      }

      const newAttendance = await prisma.attendance.create({
        data: {
          memberId,
          checkInTime,
          checkOutTime,
        },
      });

      successRes(res, newAttendance);
    } catch (error: any) {
      if (errorUnique(error)) {
        errBadRequest(next, error.message);
        return;
      }

      errInternalServer(next);
    }
  }

  static async getAttendances(req: Request, res: Response, next: NextFunction) {
    try {
      const attendances = await prisma.attendance.findMany();

      successRes(res, attendances);
    } catch (error: any) {
      if (errorValidation(error)) {
        errBadRequest(next, error.message);
        return;
      }

      errInternalServer(next);
    }
  }

  static async getAttendance(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const attendance = await prisma.attendance.findUnique({
        where: {
          id: Number(id),
        },
      });

      successRes(res, attendance);
    } catch (error: any) {
      if (errorValidation(error)) {
        errBadRequest(next, error.message);
        return;
      }

      errInternalServer(next);
    }
  }

  static async updateAttendance(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { id } = req.params;
      const { memberId, checkInTime, checkOutTime } = req.body;

      if (!memberId || !checkInTime) {
        errBadRequest(next, locale.payloadInvalid);
      }

      const updateAttendance = await prisma.attendance.update({
        where: {
          id: Number(id),
        },
        data: {
          memberId,
          checkInTime,
          checkOutTime,
        },
      });

      successRes(res, updateAttendance);
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

  static async deleteAttendance(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { id } = req.params;

      await prisma.attendance.delete({
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
