import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import roleMiddleware from "../middlewares/roleMiddleware.js";
import * as messageController from "../controllers/messageController.js";

const router = express.Router();

// Admins and technicians can get messages from tickets they created or are assigned to
// Users can get messages from tickets they created only
// router.get(
//   "/by-ticket/:ticket_id",
//   authMiddleware,
//   roleMiddleware([1, 2, 3]),
//   messageController.getMessagesByTicket,
// );

// // Admins and technicians can get messages from tickets they created or are assigned to
// // Users can get messages from tickets they created only
// router.get(
//   "/by-sender/:user_id",
//   authMiddleware,
//   roleMiddleware([1, 2, 3]),
//   messageController.getMessagesBySender,
// );

// // Any ticket creator or assignee can create messages in their tickets
// router.post(
//   "/",
//   authMiddleware,
//   roleMiddleware([1, 2, 3]),
//   messageController.createMessage,
// );

// // Any ticket creator or assignee can update messages in their tickets
// router.patch(
//   "/",
//   authMiddleware,
//   roleMiddleware([1, 2, 3]),
//   messageController.updateMessage,
// );

// // Any ticket creator or assignee can delete messages in their tickets
// router.delete(
//   "/",
//   authMiddleware,
//   roleMiddleware([1, 2, 3]),
//   messageController.deleteMessage,
// );

export default router;
