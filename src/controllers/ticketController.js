const ticketModel = require("../models/ticketModel");

async function getAllTickets(req, res) {
  try {
    const tickets = await ticketModel.getAllTickets();
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

module.exports = {
  getAllTickets,
};
