const db = require("../config/db");

async function getAllUsers() {
  const [rows] = await db.query(
    "SELECT id, username, email, role_id FROM Users",
  );
  return rows;
}

module.exports = {
  getAllUsers,
};
