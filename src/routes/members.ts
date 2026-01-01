import express from "express";
import { MembersController } from "../controllers";
import { upload } from "../middleware/upload";

const router = express.Router();

router.post(
  "/",
  upload.single("profilePhoto"),
  MembersController.createMember
);
router.get("/", MembersController.getMembers);
router.get("/:id", MembersController.getMember);
router.put("/:id", MembersController.updateMember);
router.delete("/:id", MembersController.deleteMember);

export default router;
