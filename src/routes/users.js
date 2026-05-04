import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import roleMiddleware from "../middlewares/roleMiddleware.js";
import * as userController from "../controllers/userController.js";
const router = express.Router();

// Only admins can manage users
router.get(
  "/",
  authMiddleware,
  roleMiddleware([1]),
  userController.getAllUsers,
);

router.post(
  "/",
  authMiddleware,
  roleMiddleware([1]),
  userController.createUser,
);

router.patch(
  "/:id",
  authMiddleware,
  roleMiddleware([1]),
  userController.updateUser,
);

router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware([1]),
  userController.deleteUser,
);

router.patch(
  "/:id/activate",
  authMiddleware,
  roleMiddleware([1]),
  userController.activateUser,
);

router.patch(
  "/:id/deactivate",
  authMiddleware,
  roleMiddleware([1]),
  userController.deactivateUser,
);

export default router;
