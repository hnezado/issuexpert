import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import roleMiddleware from "../middlewares/roleMiddleware.js";
import * as categoryController from "../controllers/categoryController.js";
const router = express.Router();

// Only admins and technicians can manage categories
router.get(
  "/",
  authMiddleware,
  roleMiddleware([1]),
  categoryController.getAllCategories,
);

router.post(
  "/create",
  authMiddleware,
  roleMiddleware([1]),
  categoryController.createCategory,
);
router.post(
  "/update",
  authMiddleware,
  roleMiddleware([1]),
  categoryController.updateCategory,
);
router.post(
  "/delete",
  authMiddleware,
  roleMiddleware([1]),
  categoryController.deleteCategory,
);

export default router;
