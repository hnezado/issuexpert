const express = require("express");
const router = express.Router();

const ticketController = require("../controllers/ticketController");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");

// Only admin and technitians roles are able to see all tickets
router.get(
  "/",
  authMiddleware,
  roleMiddleware([1, 2]),
  ticketController.getAllTickets,
);
router.post("/new", authMiddleware, ticketController.createTicket);

module.exports = router;
