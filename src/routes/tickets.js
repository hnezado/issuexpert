import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import roleMiddleware from "../middlewares/roleMiddleware.js";
import * as ticketController from "../controllers/ticketController.js";

const router = express.Router();

// // Only admins can get all tickets (middleware)
router.get(
  "/",
  authMiddleware,
  roleMiddleware([1]),
  ticketController.getAllTickets,
);

// // Only admins can get all assigned tickets (middleware)
// router.get(
//   "/assigned",
//   authMiddleware,
//   roleMiddleware([1]),
//   ticketController.getAllAssignedTickets,
// );

// Only admins and technicians can all unassigned tickets (middleware)
router.get(
  "/unassigned",
  authMiddleware,
  roleMiddleware([1, 2]),
  ticketController.getAllUnassignedTickets,
);

// // Only admins can get tickets assigned to any account (middleware)
// // Technicians can only get tickets assigned to themselves or other technicians (controller)
router.get(
  "/assigned/:id",
  authMiddleware,
  roleMiddleware([1, 2]),
  ticketController.getTicketsAssignedToUser,
);

// DO NOT USE (REDUNDANT)
// // Any authenticated user can get tickets they created (middleware)
// router.get(
//   "/created",
//   authMiddleware,
//   roleMiddleware([1, 2, 3]),
//   ticketController.getTicketsCreatedByCurrentUser,
// );

// DO NOT USE (REDUNDANT)
// // Admins and technicians can get tickets assigned to themselves (middleware)
// router.get(
//   "/assigned",
//   authMiddleware,
//   roleMiddleware([1, 2]),
//   ticketController.getTicketsAssignedToCurrentUser,
// );

// // Only admins can get tickets created by any account (controller)
// // Technicians can only get tickets created by themselves and users (controller)
// // Users can only get tickets they created (controller)
router.get(
  "/created/:id",
  authMiddleware,
  roleMiddleware([1, 2, 3]),
  ticketController.getTicketsCreatedByUser,
);

// // Any authenticated account can create new tickets
router.post(
  "/",
  authMiddleware,
  roleMiddleware([1, 2, 3]),
  ticketController.createTicket,
);

// // Only admins can update any ticket
// // Technicians can update tickets they created or are assigned to
// // Users can only update tickets they created
router.patch(
  "/:id",
  authMiddleware,
  roleMiddleware([1, 2, 3]),
  ticketController.updateTicket,
);

// // Only admins can modify any ticket status
// // Technicians can modify the status of tickets they created or are assigned to
// router.patch(
//   "/status",
//   authMiddleware,
//   roleMiddleware([1, 2]),
//   ticketController.updateStatus,
// );

// // Only admins can assign tickets to any account
// // Technicians can only assign tickets to themselves
// router.patch(
//   "/assign",
//   authMiddleware,
//   roleMiddleware([1, 2]),
//   ticketController.assignTicket,
// );

// // Only admins can unassign tickets from any account
// // Technicians can only unassign their own tickets
// router.patch(
//   "/unassign",
//   authMiddleware,
//   roleMiddleware([1, 2]),
//   ticketController.unassignTicket,
// );

// // Only admins can delete any ticket
// // Technicians can delete tickets they created
// // Users can delete tickets they created
router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware([1, 2, 3]),
  ticketController.deleteTicket,
);

export default router;
