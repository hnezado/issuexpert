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
    LEFT JOIN status s ON t.status_id = s.id
    WHERE t.is_deleted = 0
    ORDER BY t.created_at DESC;
  `;

  const [result] = await db.execute(sql);
  return result;
}

async function getTicketsByUser(userId) {
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
    LEFT JOIN status s ON t.status_id = s.id
    WHERE t.created_by = ? AND t.is_deleted = 0
    ORDER BY t.created_at DESC;
  `;

  const [result] = await db.execute(sql, [userId]);
  return result;
}

async function getTicketsAssigned(userId) {
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
    LEFT JOIN status s ON t.status_id = s.id
    WHERE t.assigned_to = ? AND t.is_deleted = 0
    ORDER BY t.created_at DESC;
  `;

  const [result] = await db.execute(sql, [userId]);
  return result;
}

async function createTicket(
  title,
  description,
  priority,
  status_id,
  created_by,
) {
  const sql = `
    INSERT INTO Tickets (title, description, priority, status_id, created_by)
    VALUES (?, ?, ?, ?, ?)
    `;

  const [result] = await db.execute(sql, [
    title,
    description,
    priority,
    status_id,
    created_by,
  ]);
  return result;
}

// Updates a ticket dynamically based on provided fields
async function updateTicket(fields, values) {
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

async function assignTicket(ticketId, technicianId) {
  const sql = `
    UPDATE Tickets
    SET assigned_to = ?
    WHERE id = ? AND is_deleted = 0
    `;

  const [result] = await db.execute(sql, [technicianId, ticketId]);
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
  getTicketsByUser,
  getTicketsAssigned,
  createTicket,
  updateTicket,
  updateTicketStatus,
  assignTicket,
  deleteTicket,
};
