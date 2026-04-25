import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import * as messageController from "../controllers/messageController.js";

const router = express.Router();

router.post("/new", authMiddleware, messageController.createMessage);
router.get("/:ticketId", authMiddleware, messageController.getMessages);

export default router;
