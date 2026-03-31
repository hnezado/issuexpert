const db = require("../config/db");

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
            t.created_at
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

module.exports = {
  getAllTickets,
  createTicket,
  assignTicket,
  updateTicketStatus,
};
