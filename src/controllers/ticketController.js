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

async function assignTicket(req, res) {
  try {
    const { ticketId, technicianId } = req.body;

    const updated = await ticketModel.assignTicket(ticketId, technicianId);

    if (updated === 0) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    res.json({ message: "Ticket assigned successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

module.exports = {
  getAllTickets,
  createTicket,
  assignTicket,
};
