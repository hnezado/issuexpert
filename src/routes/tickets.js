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
// Only admin and technitians roles are able to assign tickets
router.put(
  "/assign",
  authMiddleware,
  roleMiddleware([1, 2]),
  ticketController.assignTicket,
);

module.exports = router;
