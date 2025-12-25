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

export default class MembersController {
  static async createMember(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        name,
        email,
        phone,
        dob,
        address,
        profilePhoto,
        status,
        joinDate,
        expirationDate,
        planId,
      } = req.body;

      if (!name || !email || !phone || !dob || !address || !status || !planId) {
        errBadRequest(next, locale.payloadInvalid);
      }

      const newMember = await prisma.members.create({
        data: {
          name,
          email,
          phone,
          dob: new Date(dob),
          address,
          profilePhoto,
          status,
          joinDate: new Date(joinDate),
          expirationDate: new Date(expirationDate),
          planId: Number(planId),
        },
      });

      successRes(res, newMember);
    } catch (error: any) {
      console.log(error)
      if (errorUnique(error)) {
        errBadRequest(next, error.message);
        return;
      }

      errInternalServer(next);
    }
  }

  static async getMembers(req: Request, res: Response, next: NextFunction) {
    try {
      const members = await prisma.members.findMany();

      successRes(res, members);
    } catch (error: any) {
      if (errorValidation(error)) {
        errBadRequest(next, error.message);
        return;
      }

      errInternalServer(next);
    }
  }

  static async getMember(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
       
      const member = await prisma.members.findUnique({
        where: {
          id: Number(id),
        }
      });

      successRes(res, member);
    } catch (error: any) {
      if (errorValidation(error)) {
        errBadRequest(next, error.message);
        return;
      }

      errInternalServer(next);
    }
  }

  static async updateMember(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const {
        name,
        email,
        phone,
        dob,
        address,
        profilePhoto,
        status,
        joinDate,
        expirationDate,
        planId,
      } = req.body;

      if (!name || !email || !phone || !dob || !address || !status || !planId) {
        errBadRequest(next, locale.payloadInvalid);
      }

      const updateMember = await prisma.members.update({
        where: {
          id: Number(id),
        },
        data: {
          name,
          email,
          phone,
          dob,
          address,
          profilePhoto,
          status,
          joinDate,
          expirationDate,
          planId: Number(planId),
        },
      });

      successRes(res, updateMember);
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

  static async deleteMember(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      await prisma.members.delete({
        where: {
          id: Number(id),
        }
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
