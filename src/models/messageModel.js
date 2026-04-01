const { get } = require("../app");
const db = require("../config/db");

async function createMessage(ticketId, senderId, message) {
  const [result] = await db.query(
    `
        INSERT INTO Messages (ticket_id, sender_id, message)
        VALUES (?, ?, ?)
    `,
    [ticketId, senderId, message],
  );

  return result.insertId;
}

async function getMessagesByTicket(ticketId) {
  const [rows] = await db.query(
    `
        SELECT 
            m.id,
            m.message,
            m.created_at,
            u.username AS sender
        FROM Messages m
        LEFT JOIN Users u ON m.sender_id = u.id
        WHERE m.ticket_id = ?
        ORDER BY m.created_at ASC
    `,
    [ticketId],
  );

  return rows;
}

module.exports = {
  createMessage,
  getMessagesByTicket,
};
