import { PrismaClient } from "@prisma/client";
import { NextFunction, Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { errBadRequest, errInternalServer, successRes } from "../utils";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

export default class AuthController {
  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        errBadRequest(next, "Email and password are required");
        return;
      }

      const user = await prisma.users.findUnique({
        where: { email },
      });

      if (!user) {
        errBadRequest(next, "Invalid credentials");
        return;
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        errBadRequest(next, "Invalid credentials");
        return;
      }

      const token = jwt.sign(
        { id: user.id, email: user.email },
        JWT_SECRET,
        { expiresIn: "3h" }
      );

      const { password: _, ...userData } = user;
      
      successRes(res, {
        token,
        user: userData,
      });
    } catch (error) {
      console.error("Login error:", error);
      errInternalServer(next);
    }
  }
}