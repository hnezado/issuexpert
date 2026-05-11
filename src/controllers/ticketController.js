import * as ticketModel from "../models/ticketModel.js";
import * as userModel from "../models/userModel.js";
import logger from "../utils/logger.js";
import { getStatusId } from "../utils/statuses.js";

// Get all users excluding soft deleted ones
async function getAllTickets(req, res) {
  try {
    const tickets = await ticketModel.getAllTickets();
    res.status(200).json(tickets);
  } catch (error) {
    logger.error(
      "TicketController.getAllTickets: error retrieving all tickets",
      { error },
    );
    res.status(500).json({ message: "Internal server error" });
  }
}

async function getAllAssignedTickets(req, res) {
  try {
    const assignedTickets = await ticketModel.getAllAssignedTickets();

    res.status(200).json({
      message: "All assigned tickets retrieved",
      data: assignedTickets,
    });
  } catch (error) {
    logger.error(
      "TicketController.getAllAssignedTickets: error retrieving all assigned tickets",
      { error },
    );
    res.status(500).json({ message: "Internal server error" });
  }
}

async function getAllUnassignedTickets(req, res) {
  try {
    const unassignedTickets = await ticketModel.getAllUnassignedTickets();

    res.status(200).json({
      message: "All unassigned tickets retrieved",
      data: unassignedTickets,
    });
  } catch (error) {
    logger.error(
      "TicketController.getAllUnassignedTickets: error retrieving all unassigned tickets",
      { error },
    );
    res.status(500).json({ message: "Internal server error" });
  }
}

async function getTicketsCreatedByCurrentUser(req, res) {
  try {
    const currentUserId = req.user.id;

    const tickets = await ticketModel.getTicketsCreatedByUser(currentUserId);

    res.status(200).json({
      message: "Current user tickets retrieved",
      data: tickets,
    });
  } catch (error) {
    logger.error(
      "TicketController.getTicketsCreatedByCurrentUser: error retrieving current user tickets",
      { error },
    );
    res.status(500).json({ message: "Internal server error" });
  }
}

async function getTicketsCreatedByUser(req, res) {
  try {
    const requesterId = req.user.id;
    const requesterRole = req.user.role;
    const targetId = Number(req.params.user_id);
    const target = await userModel.getUserById(targetId);

    if (!target) {
      logger.warn(
        "TicketController.getTicketsCreatedByUser: target user not found",
      );
      return res.status(404).json({ message: "Target user not found" });
    }

    const targetRole = target.role;

    // Role restriction
    const isAdmin = requesterRole === "admin";
    const isTechnician = requesterRole === "technician";
    const isUser = requesterRole === "user";
    const isSelf = requesterId === targetId;
    const targetIsUser = targetRole === "user";

    const allowed =
      isAdmin ||
      (isTechnician && (isSelf || targetIsUser)) ||
      (isUser && isSelf);

    if (!allowed) {
      logger.warn("TicketController.getTicketsCreatedByUser: forbidden access");
      return res.status(403).json({ message: "Forbidden" });
    }

    const tickets = await ticketModel.getTicketsCreatedByUser(targetId);

    res.status(200).json({
      message: "User tickets retrieved",
      data: tickets,
    });
  } catch (error) {
    logger.error(
      "TicketController.getTicketsCreatedByUser: error retrieving user tickets",
      { error },
    );
    res.status(500).json({ message: "Internal server error" });
  }
}

async function getTicketsAssignedToCurrentUser(req, res) {
  try {
    const requesterId = req.user.id;

    const tickets = await ticketModel.getTicketsAssignedToUser(requesterId);

    res.status(200).json({
      message: "User tickets retrieved",
      data: tickets,
    });
  } catch (error) {
    logger.error(
      "TicketController.getTicketsAssignedToCurrentUser: error retrieving current user tickets",
      { error },
    );
    res.status(500).json({ message: "Internal server error" });
  }
}

async function getTicketsAssignedToUser(req, res) {
  try {
    const requesterId = req.user.id;
    const requesterRole = req.user.role;

    const targetId = Number(req.params.user_id);

    const target = await userModel.getUserById(targetId);

    if (!target) {
      logger.warn(
        "TicketController.getTicketsAssignedToUser: target user not found",
      );
      return res.status(404).json({
        message: "Target user not found",
      });
    }

    // Role restriction
    const isAdmin = requesterRole === "admin";
    const isTechnician = requesterRole === "technician";
    const isSelf = requesterId === targetId;
    const targetIsTechnician = target.role === "technician";

    const allowed = isAdmin || (isTechnician && (isSelf || targetIsTechnician));

    if (!allowed) {
      logger.warn(
        "TicketController.getTicketsAssignedToUser: forbidden access",
      );
      return res.status(403).json({
        message: "Forbidden",
      });
    }

    const tickets = await ticketModel.getTicketsAssignedToUser(targetId);

    return res.status(200).json({
      message: "User assigned tickets retrieved",
      data: tickets,
    });
  } catch (error) {
    logger.error(
      "TicketController.getTicketsAssignedToUser: error retrieving assigned tickets",
      { error },
    );
    return res.status(500).json({
      message: "Internal server error",
    });
  }
}

async function createTicket(req, res) {
  try {
    const { title, description, priority } = req.body;

    if (!title) {
      logger.warn("TicketController.createTicket: missing title");
      return res.status(400).json({ message: "Missing title" });
    }

    // Insert ticket in DB
    const result = await ticketModel.createTicket(
      title,
      description ?? null,
      priority ?? 5,
      req.user.id,
    );

    res.status(201).json({
      message: "Ticket created",
      data: {
        ticketId: result.insertId,
      },
    });
  } catch (error) {
    logger.error("TicketController.createTicket: error creating ticket", {
      error,
    });
    res.status(500).json({ message: error.message });
  }
}

async function updateTicket(req, res) {
  try {
    const ticketId = Number(req.params.id);
    const requesterId = req.user.id;
    const requesterRole = req.user.role;

    if (!Number.isInteger(ticketId) || ticketId <= 0) {
      logger.warn("TicketController.updateTicket: invalid ticket id");
      return res.status(400).json({ message: "Invalid ticket id" });
    }

    const ticket = await ticketModel.findById(ticketId);

    if (!ticket) {
      logger.warn("TicketController.updateTicket: ticket not found");
      return res.status(404).json({ message: "Ticket not found" });
    }

    // Role restriction
    const isAdmin = requesterRole === "admin";
    const isTechnician = requesterRole === "technician";
    const isUser = requesterRole === "user";
    const isCreator = ticket.created_by === requesterId;
    const isAssigned = ticket.assigned_to === requesterId;

    const allowed =
      isAdmin ||
      (isTechnician && (isCreator || isAssigned)) ||
      (isUser && isCreator);

    if (!allowed) {
      logger.warn("TicketController.updateTicket: forbidden access");
      return res.status(403).json({ message: "Forbidden" });
    }

    const { title, description, priority } = req.body;
    const status_id = getStatusId(req.body.status);
    getStatusId;

    if (!title) {
      logger.warn("TicketController.createTicket: missing title");
      return res.status(400).json({ message: "Missing title" });
    }

    // Update only allowed fields
    const fields = [];
    const values = [];

    if (title !== ticket.title) {
      fields.push("title = ?");
      values.push(title);
    }

    if (description !== undefined && description !== ticket.description) {
      fields.push("description = ?");
      values.push(description);
    }

    if (priority !== undefined && priority !== ticket.priority) {
      fields.push("priority = ?");
      values.push(priority);
    }

    if (status_id !== undefined && status_id !== ticket.status_id) {
      fields.push("status_id = ?");
      values.push(status_id);
    }

    if (fields.length === 0) {
      logger.info("TicketController.updateTicket: no changes detected");
      return res.status(200).json({
        message: "No changes detected",
      });
    }

    // Identifies ticket in the query
    values.push(ticketId);

    const result = await ticketModel.updateTicket(fields, values);

    if (result.affectedRows === 0) {
      logger.info("TicketController.updateTicket: no changes applied");
      return res.status(200).json({
        message: "No changes applied",
      });
    }

    return res.status(200).json({
      message: "Ticket updated",
    });
  } catch (error) {
    logger.error("TicketController.updateTicket: error updating ticket", {
      error,
    });
    return res.status(500).json({
      message: "Internal server error",
    });
  }
}

async function updateStatus(req, res) {
  try {
    const ticketId = Number(req.params.id);
    const requesterId = req.user.id;
    const requesterRole = req.user.role;

    if (!Number.isInteger(ticketId) || ticketId <= 0) {
      logger.warn("TicketController.updateStatus: invalid ticket id");
      return res.status(400).json({ message: "Invalid ticket id" });
    }

    const { status_id } = req.body;

    if (!status_id) {
      logger.warn("TicketController.updateStatus: missing status_id");
      return res.status(400).json({ message: "Missing status_id" });
    }

    const ticket = await ticketModel.findById(ticketId);

    if (!ticket) {
      logger.warn("TicketController.updateStatus: ticket not found");
      return res.status(404).json({ message: "Ticket not found" });
    }

    // Role restriction
    const isAdmin = requesterRole === "admin";
    const isTechnician = requesterRole === "technician";
    const isCreator = Number(ticket.created_by) === requesterId;
    const isAssigned = Number(ticket.assigned_to) === requesterId;

    const allowed = isAdmin || (isTechnician && (isCreator || isAssigned));

    if (!allowed) {
      logger.warn("TicketController.updateStatus: forbidden access");
      return res.status(403).json({ message: "Forbidden" });
    }

    if (status_id === ticket.status_id) {
      logger.info("TicketController.updateStatus: no changes detected");
      return res.status(200).json({
        message: "No changes detected",
      });
    }

    const result = await ticketModel.updateTicketStatus(ticketId, status_id);

    if (result.affectedRows === 0) {
      logger.info("TicketController.updateStatus: no changes applied");
      return res.status(200).json({
        message: "No changes applied",
      });
    }

    return res.status(200).json({
      message: "Status updated",
    });
  } catch (error) {
    logger.error("TicketController.updateStatus: error updating status", {
      error,
    });
    return res.status(500).json({
      message: "Internal server error",
    });
  }
}

async function assignTicket(req, res) {
  try {
    const ticketId = Number(req.params.id);
    const requesterId = req.user.id;
    const requesterRole = req.user.role;

    if (!Number.isInteger(ticketId) || ticketId <= 0) {
      logger.warn("TicketController.assignTicket: invalid ticket id");
      return res.status(400).json({ message: "Invalid ticket id" });
    }

    const assignedTo = Number(req.body.assigned_to);

    if (!Number.isInteger(assignedTo) || assignedTo <= 0) {
      logger.warn("TicketController.assignTicket: invalid assigned_to");
      return res.status(400).json({ message: "Invalid assigned_to" });
    }

    const ticket = await ticketModel.findById(ticketId);

    if (!ticket) {
      logger.warn("TicketController.assignTicket: ticket not found");
      return res.status(404).json({ message: "Ticket not found" });
    }

    // Role restriction
    const isAdmin = requesterRole === "admin";
    const isTechnician = requesterRole === "technician";
    const willSelfAssign = assignedTo === requesterId;

    const allowed = isAdmin || (isTechnician && willSelfAssign);

    if (!allowed) {
      logger.warn("TicketController.assignTicket: forbidden access");
      return res.status(403).json({ message: "Forbidden" });
    }

    const result = await ticketModel.assignTicket(ticketId, assignedTo);

    if (result.affectedRows === 0) {
      logger.info("TicketController.assignTicket: no changes applied");
      return res.status(200).json({ message: "No changes applied" });
    }

    return res.status(200).json({
      message: "Ticket assigned",
    });
  } catch (error) {
    logger.error("TicketController.assignTicket: error assigning ticket", {
      error,
    });
    return res.status(500).json({ message: "Internal server error" });
  }
}

async function unassignTicket(req, res) {
  try {
    const ticketId = Number(req.params.id);
    const requesterId = req.user.id;
    const requesterRole = req.user.role;

    if (!Number.isInteger(ticketId) || ticketId <= 0) {
      logger.warn("TicketController.unassignTicket: invalid ticket id");
      return res.status(400).json({ message: "Invalid ticket id" });
    }

    const ticket = await ticketModel.findById(ticketId);

    if (!ticket) {
      logger.warn("TicketController.unassignTicket: ticket not found");
      return res.status(404).json({ message: "Ticket not found" });
    }

    const isAdmin = requesterRole === "admin";
    const isTechnician = requesterRole === "technician";
    const isAssigned = Number(ticket.assigned_to) === requesterId;

    const allowed = isAdmin || (isTechnician && isAssigned);

    if (!allowed) {
      logger.warn("TicketController.unassignTicket: forbidden access");
      return res.status(403).json({ message: "Forbidden" });
    }

    const result = await ticketModel.unassignTicket(ticketId);

    if (result.affectedRows === 0) {
      logger.info("TicketController.unassignTicket: no changes applied");
      return res.status(200).json({ message: "No changes applied" });
    }

    return res.status(200).json({
      message: "Ticket unassigned",
    });
  } catch (error) {
    logger.error("TicketController.unassignTicket: error unassigning ticket", {
      error,
    });
    return res.status(500).json({ message: "Internal server error" });
  }
}

async function deleteTicket(req, res) {
  try {
    const ticketId = Number(req.params.id);
    const userId = req.user.id;
    const userRole = req.user.role;

    const ticket = await ticketModel.findById(ticketId);

    if (!ticket) {
      logger.warn("TicketController.deleteTicket: ticket not found");
      return res.status(404).json({ message: "Ticket not found" });
    }

    const isOwner = ticket.created_by === userId;
    const isAdmin = userRole === "admin";

    // Only owner or admin can delete
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: "Forbidden" });
    }

    await ticketModel.deleteTicket(ticketId);

    res.status(200).json({ message: "Ticket deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export {
  getAllTickets,
  getAllAssignedTickets,
  getAllUnassignedTickets,
  getTicketsCreatedByCurrentUser,
  getTicketsCreatedByUser,
  getTicketsAssignedToCurrentUser,
  getTicketsAssignedToUser,
  createTicket,
  updateTicket,
  updateStatus,
  assignTicket,
  unassignTicket,
  deleteTicket,
};
