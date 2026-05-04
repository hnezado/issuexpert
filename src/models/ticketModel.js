import db from "../config/db.js";

async function getAllTickets() {
  const [rows] = await db.query(`
    SELECT 
        t.id,
        t.title,
        t.description,
        t.priority,
        t.status_id,
        t.created_by,
        t.assigned_to,
        t.created_at,
        t.updated_at
    FROM Tickets t
  `);

  return rows;
}

async function createTicket(data) {
  const { title, description, priority, status_id, created_by } = data;

  const [result] = await db.query(
    `
    INSERT INTO Tickets (title, description, priority, status_id, created_by)
    VALUES (?, ?, ?, ?, ?)
    `,
    [title, description, priority, status_id, created_by],
  );

  return result.insertId;
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

async function assignTicket(ticketId, technicianId) {
  const [result] = await db.query(
    `
    UPDATE Tickets
    SET assigned_to = ?
    WHERE id = ?
    `,
    [technicianId, ticketId],
  );

  return result.affectedRows;
}

async function updateTicketStatus(ticketId, statusId) {
  const [result] = await db.query(
    `
    UPDATE Tickets
    SET status_id = ?
    WHERE id = ?
    `,
    [statusId, ticketId],
  );

  return result.affectedRows;
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

async function getTicketsByUser(userId) {
  const [rows] = await db.query(
    `
    SELECT *
    FROM Tickets
    WHERE created_by = ?
    ORDER BY created_at DESC
    `,
    [userId],
  );

  return rows;
}

async function getTicketsAssigned(userId) {
  const [rows] = await db.query(
    `
    SELECT *
    FROM Tickets
    WHERE assigned_to = ?
    ORDER BY updated_at DESC
    `,
    [userId],
  );

  return rows;
}

export {
  getAllTickets,
  createTicket,
  assignTicket,
  updateTicketStatus,
  getTicketsByUser,
  getTicketsAssigned,
};
