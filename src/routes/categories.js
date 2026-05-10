import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import roleMiddleware from "../middlewares/roleMiddleware.js";
import * as categoryController from "../controllers/categoryController.js";

const router = express.Router();

// Only admins and technicians can get all categories
router.get(
  "/",
  authMiddleware,
  roleMiddleware([1, 2]),
  categoryController.getAllCategories,
);

// // Anyone can get ticket categories
// router.get(
//   "/by-ticket/:ticket_id",
//   authMiddleware,
//   roleMiddleware([1, 2, 3]),
//   categoryController.getCategoriesByTicket,
// );

// // Only admins can create categories
// router.post(
//   "/",
//   authMiddleware,
//   roleMiddleware([1]),
//   categoryController.createCategory,
// );

// // Only admins can update categories
// router.patch(
//   "/",
//   authMiddleware,
//   roleMiddleware([1]),
//   categoryController.updateCategory,
// );

// // Anyone can assign categories to tickets
// router.patch(
//   "/assign",
//   authMiddleware,
//   roleMiddleware([1, 2, 3]),
//   categoryController.assignCategory,
// );

// // Anyone can unassign categories from tickets
// router.patch(
//   "/unassign",
//   authMiddleware,
//   roleMiddleware([1, 2, 3]),
//   categoryController.unassignCategory,
// );

// // Only admins can delete categories
// router.delete(
//   "/",
//   authMiddleware,
//   roleMiddleware([1]),
//   categoryController.deleteCategory,
// );

export default router;
