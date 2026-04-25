import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import roleMiddleware from "../middlewares/roleMiddleware.js";
import * as userController from "../controllers/userController.js";
const router = express.Router();

router.get(
  "/",
  authMiddleware,
  roleMiddleware([1]),
  userController.getAllUsers,
);

router.post("/new", userController.createUser);

export default router;
