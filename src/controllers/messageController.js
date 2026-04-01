const messageModel = require("../models/messageModel");

async function createMessage(req, res) {
  try {
    const { ticketId, message } = req.body;

    const senderId = req.user.id;

    const id = await messageModel.createMessage(ticketId, senderId, message);

    res.status(201).json({
      message: "Message created",
      messageId: id,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

async function getMessages(req, res) {
  try {
    const { ticketId } = req.params;

    const messages = await messageModel.getMessagesByTicket(ticketId);

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

module.exports = {
  createMessage,
  getMessages,
};
