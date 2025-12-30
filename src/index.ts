import express from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";
import { attendancesRouter, categoriesRouter, membersRouter, plansRouter, transactionsRouter } from "./routes";
import { startScannerServer } from "./scanner/scanner.ws";

const prisma = new PrismaClient();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/members", membersRouter);
app.use("/transactions", transactionsRouter);
app.use("/attendances", attendancesRouter);
app.use("/plans", plansRouter);
app.use("/categories", categoriesRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

startScannerServer();
