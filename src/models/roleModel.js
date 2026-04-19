const db = require("../config/db");

async function findById(id) {
  console.log("Finding role by id...");
  const sql = `SELECT * FROM Roles WHERE id = ?`;
  const [rows] = await db.execute(sql, [id]);
  return rows[0];
}

module.exports = {
  findById,
};
