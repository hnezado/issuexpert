import * as ticketModel from "../models/ticketModel.js";

async function getAllTickets(req, res) {
  try {
    const tickets = await ticketModel.getAllTickets();

    res.status(200).json({
      message: "All tickets retrieved",
      data: tickets,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

async function getMyTickets(req, res) {
  try {
    const userId = req.user.id;

    const tickets = await ticketModel.getTicketsByUser(userId);

    res.status(200).json({
      message: "My tickets retrieved",
      data: tickets,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

async function getAssignedTickets(req, res) {
  try {
    const userId = req.user.id;

    const tickets = await ticketModel.getTicketsAssigned(userId);

    res.status(200).json({
      message: "Assigned tickets retrieved",
      data: tickets,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

async function createTicket(req, res) {
  try {
    const { title, description, priority, status_id } = req.body;

    // Checking required fields
    if (!title || status_id == null) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const ticketData = {
      title,
      status_id,
      created_by: req.user.id,
    };

    if (description !== undefined) {
      ticketData.description = description;
    }

    if (priority !== undefined) {
      ticketData.priority = priority;
    }

    // Insert ticket in DB
    const id = await ticketModel.createTicket(ticketData);

    res.status(201).json({
      message: "Ticket created",
      ticketId: id,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// Partial ticket update
async function updateTicket(req, res) {
  try {
    const ticketId = Number(req.params.id);
    const userRole = req.user.role_id;

    const { title, description, priority } = req.body;

    // Validate ID
    if (!ticketId || ticketId <= 0) {
      return res.status(400).json({ message: "Invalid ticketId" });
    }

    // Find ticket
    const ticket = await ticketModel.findById(ticketId);

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    const isOwner = ticket.created_by === req.user.id;
    const isAdmin = userRole === 1;

    // Permission check
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: "Forbidden" });
    }

    // Update only allowed fields
    const fields = [];
    const values = [];

    if (title !== undefined && title !== ticket.title) {
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

    if (fields.length === 0) {
      return res.status(200).json({
        message: "No changes detected in ticket",
      });
    }

    // Identifies ticket in WHERE
    values.push(ticketId);

    const updated = await ticketModel.updateTicket(fields, values);

    if (updated === 0) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    res.status(200).json({ message: "Ticket updated" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

async function deleteTicket(req, res) {
  try {
    const ticketId = Number(req.params.id);
    const userId = req.user.id;
    const userRole = req.user.role_id;

    const ticket = await ticketModel.findById(ticketId);

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    const isOwner = ticket.created_by === userId;
    const isAdmin = userRole === 1;

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

async function assignTicket(req, res) {
  try {
    const ticketId = Number(req.params.id);
    const { assigned_to } = req.body;

    const userRole = req.user.role_id;

    // Input data validation
    if (!ticketId || ticketId <= 0) {
      return res.status(400).json({ message: "Invalid ticketId" });
    }
    if (!assigned_to == null) {
      return res.status(400).json({ message: "Missing assigned_to" });
    }

    // Check role permissions
    const isAdmin = userRole === 1;
    const isTech = userRole === 2;

    if (!isAdmin && !isTech) {
      return res.status(403).json({ message: "Forbidden" });
    }

    // Technician restrictions
    if (isTech && Number(assigned_to) !== req.user.id) {
      const targetUser = await userModel.findById(assigned_to);

      if (!targetUser || targetUser.role_id !== 2) {
        return res.status(403).json({
          message: "Technicians can only assign tickets to other technicians",
        });
      }
    }

    const updated = await ticketModel.assignTicket(ticketId, assigned_to);

    if (updated === 0) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    res.status(200).json({ message: "Ticket assigned successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

async function updateStatus(req, res) {
  try {
    const ticketId = Number(req.params.id);
    const { statusId } = req.body;

    if (!ticketId || ticketId <= 0) {
      return res.status(400).json({ message: "Invalid ticketId" });
    }

    if (statusId == null || Number(statusId) <= 0) {
      return res.status(400).json({ message: "Missing statusId" });
    }

    const updated = await ticketModel.updateTicketStatus(ticketId, statusId);

    if (updated === 0) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    res.status(200).json({ message: "Ticket status updated" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export {
  getAllTickets,
  getMyTickets,
  getAssignedTickets,
  createTicket,
  updateTicket,
  deleteTicket,
  assignTicket,
  updateStatus,
};
