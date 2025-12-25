import express from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";
import { attendancesRouter, membersRouter, plansRouter, transactionsRouter } from "./routes";

const prisma = new PrismaClient();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/members", membersRouter);
app.use("/transactions", transactionsRouter);
app.use("/attendances", attendancesRouter);
app.use("/plans", plansRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
