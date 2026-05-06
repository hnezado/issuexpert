import db from "../config/db.js";

async function getMessagesByTicket(ticketId) {
  const sql = `
    SELECT 
      id,
      ticket_id,
      sender_id,
      content,
      created_at
    FROM Messages
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
    FROM Messages
    WHERE sender_id = ? AND is_deleted = 0
    ORDER BY created_at ASC
  `;

  const [result] = await db.execute(sql, [senderId]);
  return result;
}

async function createMessage(ticketId, senderId, content) {
  const sql = `
    INSERT INTO Messages (ticket_id, sender_id, content)
    VALUES (?, ?, ?)
    `;

  const [result] = await db.execute(sql, [ticketId, senderId, content]);
  return result;
}

async function updateMessage(id, content) {
  const sql = `
    UPDATE Messages
    SET content = ?
    WHERE id = ? AND is_deleted = 0
  `;

  const [result] = await db.execute(sql, [content, id]);
  return result;
}

async function deleteMessage(id) {
  const sql = `
    UPDATE Messages
    SET is_deleted = 1
    WHERE id = ? AND is_deleted = 0
  `;

  const [result] = await db.execute(sql, [id]);
  return result;
}

export {
  getMessagesByTicket,
  getMessagesBySender,
  getMessageById,
  createMessage,
  updateMessage,
  deleteMessage,
};
