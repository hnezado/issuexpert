import db from "../config/db.js";

async function getAllTickets() {
  const sql = `
    SELECT 
      t.id,
      t.title,
      t.description,
      t.priority,
      s.name AS status,
      t.created_by,
      t.assigned_to,
      t.created_at,
      t.updated_at
    FROM Tickets t
    LEFT JOIN TicketStatuses s ON t.status_id = s.id
    WHERE t.is_deleted = 0
    ORDER BY t.created_at DESC;
  `;

  const [result] = await db.execute(sql);
  return result;
}

async function findById(ticketId) {
  const sql = `
    SELECT 
      t.id,
      t.title,
      t.description,
      t.priority,
      t.status_id,
      t.created_by,
      t.assigned_to,
      t.created_at,
      t.updated_at,
      t.is_deleted
    FROM Tickets t
    WHERE t.id = ? AND t.is_deleted = 0
    LIMIT 1;
  `;

  const [result] = await db.execute(sql, [ticketId]);
  return result[0];
}

async function getAllAssignedTickets() {
  const sql = `
    SELECT 
      t.id,
      t.title,
      t.description,
      t.priority,
      s.name AS status,
      t.created_by,
      t.assigned_to,
      t.created_at,
      t.updated_at
    FROM Tickets t
    LEFT JOIN ticketstatuses s ON t.status_id = s.id
    WHERE t.assigned_to IS NOT NULL AND t.is_deleted = 0
    ORDER BY t.created_at DESC;
  `;

  const [result] = await db.execute(sql);
  return result;
}

async function getAllUnassignedTickets() {
  const sql = `
    SELECT 
      t.id,
      t.title,
      t.description,
      t.priority,
      s.name AS status,
      t.created_by,
      t.assigned_to,
      t.created_at,
      t.updated_at
    FROM Tickets t
    LEFT JOIN ticketstatuses s ON t.status_id = s.id
    WHERE t.assigned_to IS NULL AND t.is_deleted = 0
    ORDER BY t.created_at DESC;
  `;

  const [result] = await db.execute(sql);
  return result;
}

async function getTicketsCreatedByUser(userId) {
  const sql = `
    SELECT 
      t.id,
      t.title,
      t.description,
      t.priority,
      s.name AS status,
      t.created_by,
      t.assigned_to,
      t.created_at,
      t.updated_at
    FROM Tickets t
    LEFT JOIN ticketstatuses s ON t.status_id = s.id
    WHERE t.created_by = ? AND t.is_deleted = 0
    ORDER BY t.created_at DESC;
  `;

  const [result] = await db.execute(sql, [userId]);
  return result;
}

async function getTicketsAssignedToUser(userId) {
  const sql = `
    SELECT 
      t.id,
      t.title,
      t.description,
      t.priority,
      s.name AS status,
      t.created_by,
      t.assigned_to,
      t.created_at,
      t.updated_at
    FROM Tickets t
    LEFT JOIN ticketstatuses s ON t.status_id = s.id
    WHERE t.assigned_to = ? AND t.is_deleted = 0
    ORDER BY t.created_at DESC;
  `;

  const [result] = await db.execute(sql, [userId]);
  return result;
}

async function createTicket(title, description, priority, created_by) {
  const sql = `
    INSERT INTO Tickets (title, description, priority, created_by)
    VALUES (?, ?, ?, ?)
    `;

  const [result] = await db.execute(sql, [
    title,
    description,
    priority,
    created_by,
  ]);
  return result;
}

async function updateTicket(fields, values) {
  // Updates a ticket dynamically based on provided fields
  // Using safe parameter placeholders (?) to avoid SQL injection
  const sql = `
    UPDATE Tickets
    SET ${fields.join(", ")}
    WHERE id = ? AND is_deleted = 0
  `;

  const [result] = await db.execute(sql, values);
  return result;
}

async function updateTicketStatus(ticketId, statusId) {
  const sql = `
    UPDATE Tickets
    SET status_id = ?
    WHERE id = ? AND is_deleted = 0
    `;

  const [result] = await db.execute(sql, [statusId, ticketId]);
  return result;
}

async function assignTicket(ticketId, assignTo) {
  const sql = `
    UPDATE Tickets
    SET assigned_to = ?
    WHERE id = ? AND is_deleted = 0
    AND (assigned_to IS NULL OR assigned_to != ?)
    `;

  const [result] = await db.execute(sql, [assignTo, ticketId, assignTo]);
  return result;
}

async function unassignTicket(ticketId) {
  const sql = `
    UPDATE Tickets
    SET assigned_to = NULL
    WHERE id = ? AND is_deleted = 0 AND assigned_to IS NOT NULL
    `;

  const [result] = await db.execute(sql, [ticketId]);
  return result;
}

async function deleteTicket(id) {
  const sql = `
    UPDATE Tickets
    SET is_deleted = 1
    WHERE id = ? AND is_deleted = 0
  `;

  const [result] = await db.execute(sql, [id]);
  return result;
}

export {
  getAllTickets,
  findById,
  getAllAssignedTickets,
  getAllUnassignedTickets,
  getTicketsCreatedByUser,
  getTicketsAssignedToUser,
  createTicket,
  updateTicket,
  updateTicketStatus,
  assignTicket,
  unassignTicket,
  deleteTicket,
};
