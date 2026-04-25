import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import * as authController from "../controllers/authController.js";

const router = express.Router();

router.post("/login", authController.login);

// Returns user info if JWT is valid (already verified by authMiddleware)
router.get("/verify", authMiddleware, authController.verifyUser);

router.get("/user-info", authMiddleware, authController.getUserInfo);

export default router;
