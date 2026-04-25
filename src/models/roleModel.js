import db from "../config/db.js";

async function findById(id) {
  const sql = `SELECT * FROM Roles WHERE id = ?`;
  const [rows] = await db.execute(sql, [id]);
  return rows[0];
}

export { findById };
