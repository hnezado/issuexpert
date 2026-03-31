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

module.exports = {
  getAllTickets,
};
