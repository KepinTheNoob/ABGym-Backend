import express from "express";
import { PlansController } from "../controllers";

const router = express.Router();

router.post("/", PlansController.createPlan);
router.get("/", PlansController.getPlans);
router.get("/:id", PlansController.getPlan);
router.put("/:id", PlansController.updatePlan);
router.delete("/:id", PlansController.deletePlan);

export default router