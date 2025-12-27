import express from "express";
import { CategoriesController } from "../controllers";

const router = express.Router();

router.post("/", CategoriesController.createCategory);
router.get("/", CategoriesController.getCategories);
router.get("/:id", CategoriesController.getCategory);
router.put("/:id", CategoriesController.updateCategory);
router.delete("/:id", CategoriesController.deleteCategory);

export default router