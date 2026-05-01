import db from "../config/db.js";

async function getAllUsers() {
  const [rows] = await db.query(
    "SELECT id, username, email, role_id, created_at, active FROM Users",
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

async function findById(id) {
  const sql = `SELECT * FROM Users WHERE id = ?`;
  const [rows] = await db.execute(sql, [id]);
  return rows[0];
}

async function findByUsername(username) {
  const sql = `SELECT * FROM Users WHERE username = ?`;
  const [rows] = await db.execute(sql, [username]);
  return rows[0];
}

async function findByEmail(email) {
  const sql = `SELECT * FROM Users WHERE email = ?`;
  const [rows] = await db.execute(sql, [email]);
  return rows[0];
}

export { getAllUsers, createUser, findById, findByUsername, findByEmail };
