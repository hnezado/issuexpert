import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import roleMiddleware from "../middlewares/roleMiddleware.js";
import * as userController from "../controllers/userController.js";

const router = express.Router();

// Only admins can get any account (middleware)
router.get(
  "/",
  authMiddleware,
  roleMiddleware([1]),
  userController.getAllUsers,
);

// Admins can get any account (middleware)
// Technicians can only get user accounts (controller)
router.get(
  "/:id",
  authMiddleware,
  roleMiddleware([1, 2]),
  userController.getUserById,
);

// Admins can get any account (middleware)
// Technicians can only get user accounts (controller)
router.get(
  "/username/:username",
  authMiddleware,
  roleMiddleware([1, 2]),
  userController.getUserByUsername,
);

// Admins can get any account (middleware)
// Technicians can only get user accounts (controller)
router.get(
  "/email/:email",
  authMiddleware,
  roleMiddleware([1, 2]),
  userController.getUserByEmail,
);

// Only admins can create new accounts (middleware)
router.post(
  "/",
  authMiddleware,
  roleMiddleware([1]),
  userController.createUser,
);

// Only admins can update any account (middleware)
router.patch(
  "/:id",
  authMiddleware,
  roleMiddleware([1]),
  userController.updateUser,
);

// Only admins can activate any account (middleware)
router.patch(
  "/:id/activate",
  authMiddleware,
  roleMiddleware([1]),
  userController.activateUser,
);

// Only admins can deactivate any account (middleware)
router.patch(
  "/:id/deactivate",
  authMiddleware,
  roleMiddleware([1]),
  userController.deactivateUser,
);

// Only admins can delete any account (middleware)
router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware([1]),
  userController.deleteUser,
);

export default router;
