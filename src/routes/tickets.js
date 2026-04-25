import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import roleMiddleware from "../middlewares/roleMiddleware.js";
import * as ticketController from "../controllers/ticketController.js";

const router = express.Router();

// Only admin and technicians roles are able to see all tickets
router.get(
  "/",
  authMiddleware,
  roleMiddleware([1, 2]),
  ticketController.getAllTickets,
);

router.post("/new", authMiddleware, ticketController.createTicket);

// Only admin and technicians roles are able to assign tickets
router.put(
  "/assign",
  authMiddleware,
  roleMiddleware([1, 2]),
  ticketController.assignTicket,
);

// Only admin and technicians roles are able to assign tickets
router.put(
  "/status",
  authMiddleware,
  roleMiddleware([1, 2]),
  ticketController.updateStatus,
);

router.get("/my-tickets", authMiddleware, ticketController.getMyTickets);

// Only technicians
router.get(
  "/assigned",
  authMiddleware,
  roleMiddleware([2]),
  ticketController.getAssignedTickets,
);

export default router;
