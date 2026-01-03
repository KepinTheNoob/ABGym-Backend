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
import cloudinary from "../utils/cloudinary";
import sharp from "sharp";

const prisma = new PrismaClient();

interface MulterRequest extends Request {
  file: any;
}

export default class MembersController {
  static async createMember(req: Request, res: Response, next: NextFunction) {
    try {
      const requestWithFile = req as MulterRequest;

      const { name, email, phone, dob, address, joinDate, planId } = req.body;

      if (!name || !email || !phone || !dob || !planId) {
        errBadRequest(next, locale.payloadInvalid);
        return;
      }

      let profilePhotoUrl = null;

      if (requestWithFile.file) {
        const b64 = Buffer.from(requestWithFile.file.buffer).toString("base64");
        let dataURI =
          "data:" + requestWithFile.file.mimetype + ";base64," + b64;

        const uploadResponse = await cloudinary.uploader.upload(dataURI, {
          folder: "gym-members",
        });

        profilePhotoUrl = uploadResponse.secure_url;
      }

      const existingMember = await prisma.members.findUnique({
        where: { email },
      });

      if (existingMember) {
        errBadRequest(next, "Email is already registered");
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
          profilePhoto: profilePhotoUrl,
          joinDate: startDate,
          expirationDate: expirationDate,
          planId: Number(planId),
        },
      });

      let category = await prisma.categories.findFirst({
        where: { name: "Membership" },
      });

      if (!category) {
        category = await prisma.categories.create({
          data: {
            name: "Membership",
            description: "Membership payments",
          },
        });
      }

      await prisma.transactions.create({
        data: {
          memberId: newMember.id,
          categoryId: category.id,
          description: `Membership payment - ${plan.name}`,
          type: "Income",
          amount: plan.price,
          paymentMethod: "Cash",
          transactionDate: new Date(),
        },
      });

      successRes(res, newMember);
    } catch (error: any) {
      console.error(error);
      if (errorUnique(error)) {
        errBadRequest(next, error.message);
        return;
      }
      errInternalServer(next);
    }
  }

  static async getMembers(req: Request, res: Response, next: NextFunction) {
    try {
      const members = await prisma.members.findMany({
        include: {
          plans: {
            select: {
              name: true,
              durationValue: true,
              durationUnit: true,
            },
          },
        },
      });

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
      const requestWithFile = req as MulterRequest;
      const { id } = req.params;

      const { name, email, phone, dob, address, joinDate, planId } = req.body;
      console.log(req.body);

      const existingMember = await prisma.members.findUnique({
        where: { id: String(id) },
      });

      if (!existingMember) {
        errBadRequest(next, "Member not found");
        return;
      }

      let finalProfilePhoto = existingMember.profilePhoto;

      if (requestWithFile.file) {
        const optimizedBuffer = await sharp(requestWithFile.file.buffer)
          .resize({ width: 300, height: 300, fit: "cover" })
          .jpeg({ quality: 80 })
          .toBuffer();

        const b64 = optimizedBuffer.toString("base64");
        const dataURI = "data:image/jpeg;base64," + b64;

        const uploadResponse = await cloudinary.uploader.upload(dataURI, {
          folder: "gym-members",
        });

        finalProfilePhoto = uploadResponse.secure_url;
      }

      let finalJoinDate = existingMember.joinDate;
      let finalExpirationDate = existingMember.expirationDate;
      let finalPlanId = existingMember.planId;

      if (joinDate) {
        finalJoinDate = new Date(joinDate);
      }

      const isPlanChanged = planId && Number(planId) !== existingMember.planId;
      const isDateChanged =
        joinDate &&
        new Date(joinDate).getTime() !== existingMember.joinDate.getTime();

      if (isPlanChanged || isDateChanged) {
        const targetPlanId = planId ? Number(planId) : existingMember.planId;

        const plan = await prisma.plans.findUnique({
          where: { id: targetPlanId },
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

        finalPlanId = targetPlanId;
      }

      const updatedMember = await prisma.members.update({
        where: { id: String(id) },
        data: {
          name,
          email,
          phone,
          ...(dob && { dob: new Date(dob) }),
          address,
          profilePhoto: finalProfilePhoto,
          joinDate: finalJoinDate,
          expirationDate: finalExpirationDate,
          planId: finalPlanId,
        },
      });

      successRes(res, updatedMember);
    } catch (error: any) {
      console.error(error);
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

  static async renewMember(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { planId, joinDate, paymentMethod } = req.body;

      if (!planId) {
        errBadRequest(next, "Plan ID is required for renewal");
        return;
      }

      const member = await prisma.members.findUnique({
        where: { id: String(id) },
      });
      const plan = await prisma.plans.findUnique({
        where: { id: Number(planId) },
      });

      if (!member || !plan) {
        errBadRequest(next, "Member or Plan not found");
        return;
      }

      const startDate = joinDate ? new Date(joinDate) : new Date();

      const expirationDate = calculateExpiration(
        startDate,
        plan.durationValue,
        plan.durationUnit
      );

      const result = await prisma.$transaction(async (tx) => {
        const updatedMember = await tx.members.update({
          where: { id: String(id) },
          data: {
            joinDate: startDate,
            expirationDate: expirationDate,
            planId: Number(planId), 
          },
        });

        let category = await tx.categories.findFirst({
          where: { name: "Membership" },
        });

        if (!category) {
          category = await tx.categories.create({
            data: { name: "Membership", description: "Membership payments" },
          });
        }

        await tx.transactions.create({
          data: {
            memberId: member.id,
            categoryId: category.id,
            description: `Renewal - ${plan.name}`,
            type: "Income",
            amount: plan.price,
            paymentMethod: paymentMethod || "Cash",
            transactionDate: new Date(),
          },
        });

        return updatedMember;
      });

      successRes(res, result);
    } catch (error: any) {
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
  const date = new Date(start.getFullYear(), start.getMonth(), start.getDate());

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
  date.setDate(date.getDate() + 1);

  date.setUTCHours(23, 59, 59, 999);

  return date;
}

function determineMemberStatus(expirationDate: Date) {
  const now = new Date();

  if (now.getTime() > expirationDate.getTime()) {
    return "Expired";
  }

  const diffMs = expirationDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays <= 7) return "Expiring";
  
  return "Active";
}
