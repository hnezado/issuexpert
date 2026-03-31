const ticketModel = require("../models/ticketModel");

async function getAllTickets(req, res) {
  try {
    const tickets = await ticketModel.getAllTickets();
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

async function createTicket(req, res) {
  try {
    const ticketData = {
      ...req.body,
      created_by: req.user.id,
    };

    const id = await ticketModel.createTicket(ticketData);

    res.status(201).json({
      message: "Ticket created",
      ticketId: id,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

module.exports = {
  getAllTickets,
  createTicket,
};
