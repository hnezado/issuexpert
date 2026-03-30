const db = require("../config/db");

async function getAllUsers() {
  const [rows] = await db.query(
    "SELECT id, username, email, role_id FROM Users",
  );
  return rows;
}

async function createUser(username, email, password, role_id = 3) {
  const sql = `
        INSERT INTO Users (username, email, password, role_id)
        VALUES (?, ?, ?, ?)
    `;

  const [result] = await db.execute(sql, [username, email, password, role_id]);

  return result;
}

module.exports = {
  getAllUsers,
  createUser,
};
