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

module.exports = {
  createMessage,
};
