import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import * as statusController from "../controllers/statusController.js";

const router = express.Router();

router.get("/", authMiddleware, statusController.getAllStatuses);

export default router;
