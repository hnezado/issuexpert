import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import roleMiddleware from "../middlewares/roleMiddleware.js";
import * as ticketController from "../controllers/ticketController.js";

const router = express.Router();

// Only admins and technicians are able to get all the tickets
router.get(
  "/",
  authMiddleware,
  roleMiddleware([1, 2]),
  ticketController.getAllTickets,
);

// Anyone authenticated can obtain their created tickets
router.get("/me", authMiddleware, ticketController.getMyTickets);

// Only technicians can obtain their assigned tickets
router.get(
  "/me/assigned",
  authMiddleware,
  roleMiddleware([2]),
  ticketController.getAssignedTickets,
);

// Only admins and technicians are able to assign tickets
router.patch(
  "/:id/assign",
  authMiddleware,
  roleMiddleware([1, 2]),
  ticketController.assignTicket,
);

// Only admins and technicians are able to modify tickets statuses
router.patch(
  "/:id/status",
  authMiddleware,
  roleMiddleware([1, 2]),
  ticketController.updateStatus,
);

// Anyone authenticated can manage their tickets
router.post("/", authMiddleware, ticketController.createTicket);
router.patch("/:id", authMiddleware, ticketController.updateTicket);
router.delete("/:id", authMiddleware, ticketController.deleteTicket);

export default router;
