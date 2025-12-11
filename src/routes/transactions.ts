import express from "express";
import { TransactionsController } from "../controllers";

const router = express.Router();

router.post("/", TransactionsController.createTransaction);
router.get("/", TransactionsController.getTransactions);
router.get("/:id", TransactionsController.getTransaction);
router.put("/:id", TransactionsController.updateTransaction);
router.delete("/:id", TransactionsController.deleteTransaction);

export default router