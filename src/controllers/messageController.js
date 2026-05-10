import * as messageModel from "../models/messageModel.js";
import logger from "../utils/logger.js";

async function getMessagesByTicket(req, res) {
  try {
    const ticketId = Number(req.params.ticket_id);

    if (!Number.isInteger(ticketId) || ticketId <= 0) {
      logger.warn("MessageController.getMessagesByTicket: invalid ticket id");
      return res.status(400).json({ message: "Invalid ticket id" });
    }

    const messages = await messageModel.getMessagesByTicket(ticketId);

    res.json(messages);
  } catch (error) {
    logger.error(
      "MessageController.getMessages: error retrieving ticket messages",
    );
    res.status(500).json({ message: error.message });
  }
}

async function createMessage(req, res) {
  try {
    const { ticketId, content } = req.body;
    const senderId = req.user.id;

    // Checking required fields
    if (!ticketId || !senderId || !content) {
      logger.warn("MessageController.createMessage: missing required fields");
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Insert message in DB
    const messageId = await messageModel.createMessage(
      ticketId,
      senderId,
      content,
    );

    logger.info(
      "MessageController.createMessage: message created successfully",
    );
    res.status(201).json({
      message: "Message created",
      messageId,
    });
  } catch (error) {
    logger.error("MessageController.createMessage: error creating message");
    res.status(500).json({ message: error.message });
  }
}

// Partial user update
async function updateMessage(req, res) {
  try {
    const messageId = Number(req.params.message_id);

    if (!Number.isInteger(messageId) || messageId <= 0) {
      logger.warn("MessageController.updateMessage: invalid message id");
      return res.status(400).json({ message: "Invalid message id" });
    }

    const { message } = req.body;

    const updatingMessage = await messageModel.findById(messageId);

    if (!updatingMessage) {
      return res.status(404).json({ message: "Message not found" });
    }

    const fields = [];
    const values = [];

    // Only update changed fields
    if (message !== undefined && message !== updatingMessage.message) {
      fields.push("message = ?");
      values.push(message);
    }
    if (fields.length === 0) {
      return res.status(200).json({
        message: "No changes detected in user",
      });
    }

    // ID required at the end for WHERE clausule
    values.push(id);

    const result = await userModel.updateUser(fields, values);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "User updated",
    });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        message: "Username or email is already registered",
      });
    }

    res.status(500).json({ message: error.message });
  }
}

export { createMessage, getMessagesByTicket };
