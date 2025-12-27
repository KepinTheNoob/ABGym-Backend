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
        joinDate,
        planId,
      } = req.body;

      if (!name || !email || !phone || !dob || !planId) {
        errBadRequest(next, locale.payloadInvalid);
        return;
      }

      const plan = await prisma.plans.findUnique({
        where: { id: Number(planId) },
      });

      if (!plan) {
        errBadRequest(next, "Plan not found");
        return;
      }

      const startDate = joinDate ? new Date(joinDate) : new Date();
      const expirationDate = calculateExpiration(
        startDate,
        plan.durationValue,
        plan.durationUnit
      );

      const newMember = await prisma.members.create({
        data: {
          name,
          email,
          phone,
          dob: new Date(dob),
          address,
          profilePhoto,
          joinDate: startDate,
          expirationDate: expirationDate,
          planId: Number(planId),
        },
      });

      successRes(res, newMember);
    } catch (error: any) {
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

      const result = members.map((member) => ({
        ...member,
        status: determineMemberStatus(member.expirationDate),
      }));

      successRes(res, result);
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
        where: { id: String(id) },
      });

      if (!member) {
        errBadRequest(next, "Member not found");
        return;
      }

      successRes(res, {
        ...member,
        status: determineMemberStatus(member.expirationDate),
      });
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
        joinDate,
        planId,
      } = req.body;

      if (!name || !email || !phone || !dob || !planId) {
        errBadRequest(next, locale.payloadInvalid);
        return;
      }

      const existingMember = await prisma.members.findUnique({
        where: { id: String(id) },
      });

      if (!existingMember) {
        errBadRequest(next, "Member not found");
        return;
      }

      let finalJoinDate = existingMember.joinDate;
      let finalExpirationDate = existingMember.expirationDate;
      let finalPlanId = existingMember.planId;

      if (joinDate) {
        finalJoinDate = new Date(joinDate);
      }

      if (Number(planId) !== existingMember.planId) {
        const plan = await prisma.plans.findUnique({
          where: { id: Number(planId) },
        });

        if (!plan) {
          errBadRequest(next, "Plan not found");
          return;
        }

        finalExpirationDate = calculateExpiration(
          finalJoinDate,
          plan.durationValue,
          plan.durationUnit
        );

        finalPlanId = Number(planId);
      }

      const updatedMember = await prisma.members.update({
        where: { id: String(id) },
        data: {
          name,
          email,
          phone,
          dob: new Date(dob),
          address,
          profilePhoto,
          joinDate: finalJoinDate,
          expirationDate: finalExpirationDate,
          planId: finalPlanId,
        },
      });

      successRes(res, updatedMember);
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

function calculateExpiration(
  start: Date,
  value: number,
  unit: "Day" | "Week" | "Month" | "Year"
) {
  const date = new Date(start);

  switch (unit) {
    case "Day":
      date.setDate(date.getDate() + value);
      break;
    case "Week":
      date.setDate(date.getDate() + value * 7);
      break;
    case "Month":
      date.setMonth(date.getMonth() + value);
      break;
    case "Year":
      date.setFullYear(date.getFullYear() + value);
      break;
  }

  date.setHours(23, 59, 59, 999);
  return date;
}

function determineMemberStatus(expirationDate: Date) {
  const now = new Date();
  const diffMs = expirationDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return "Expired";
  if (diffDays <= 7) return "Expiring";
  return "Active";
}
