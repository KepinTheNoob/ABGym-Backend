import express from "express";
import { AttendancesController } from "../controllers";

const router = express.Router();

router.post("/", AttendancesController.createAttendance);
router.get("/", AttendancesController.getAttendances);
router.get("/:id", AttendancesController.getAttendance);
router.put("/:id", AttendancesController.updateAttendance);
router.delete("/:id", AttendancesController.deleteAttendance);

export default router