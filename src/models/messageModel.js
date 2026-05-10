import db from "../config/db.js";

async function getMessagesByTicket(ticketId) {
  const sql = `
    SELECT 
      id,
      ticket_id,
      sender_id,
      content,
      created_at
    FROM messages
    WHERE ticket_id = ? AND is_deleted = 0
    ORDER BY created_at ASC
    `;

  const [result] = await db.execute(sql, [ticketId]);
  return result;
}

async function getMessagesBySender(senderId) {
  const sql = `
    SELECT 
      id,
      ticket_id,
      sender_id,
      content,
      created_at
    FROM messages
    WHERE sender_id = ? AND is_deleted = 0
    ORDER BY created_at ASC
  `;

  const [result] = await db.execute(sql, [senderId]);
  return result;
}

async function createMessage(ticketId, senderId, content) {
  const sql = `
    INSERT INTO messages (ticket_id, sender_id, content)
    VALUES (?, ?, ?)
    `;

  const [result] = await db.execute(sql, [ticketId, senderId, content]);
  return result;
}

async function updateMessage(fields, values) {
  // Updates a ticket dynamically based on provided fields
  // Using safe parameter placeholders (?) to avoid SQL injection
  const sql = `
    UPDATE messages
    SET ${fields.join(", ")}
    WHERE id = ? AND is_deleted = 0
  `;

  const [result] = await db.execute(sql, values);
  return result;
}

async function deleteMessage(id) {
  const sql = `
    UPDATE messages
    SET is_deleted = 1
    WHERE id = ? AND is_deleted = 0
  `;

  const [result] = await db.execute(sql, [id]);
  return result;
}

export {
  getMessagesByTicket,
  getMessagesBySender,
  createMessage,
  updateMessage,
  deleteMessage,
};
