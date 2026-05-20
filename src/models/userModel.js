import db from "../config/db.js";

async function getAllUsers() {
  const sql = `
    SELECT 
      u.id,
      u.username,
      u.email,
      r.name AS role,
      u.created_at,
      u.active
    FROM users u
    LEFT JOIN roles r ON u.role_id = r.id
    WHERE u.is_deleted = 0;
  `;

  const [result] = await db.execute(sql);
  return result;
}

async function getUserById(id) {
  const sql = `
    SELECT 
      u.id,
      u.username,
      u.email,
      r.name AS role,
      u.created_at,
      u.active
    FROM users u
    LEFT JOIN roles r ON u.role_id = r.id
    WHERE u.id = ? AND u.is_deleted = 0
  `;

  const [result] = await db.execute(sql, [id]);
  return result[0];
}

async function getUserByUsername(username) {
  const sql = `
    SELECT 
      u.id,
      u.username,
      u.email,
      r.name AS role,
      u.created_at,
      u.active
    FROM users u
    LEFT JOIN roles r ON u.role_id = r.id
    WHERE u.username = ? AND u.is_deleted = 0
  `;

  const [result] = await db.execute(sql, [username]);
  return result[0];
}

async function getUserByEmail(email) {
  const sql = `
    SELECT 
      u.id,
      u.username,
      u.email,
      r.name AS role,
      u.created_at,
      u.active
    FROM users u
    LEFT JOIN roles r ON u.role_id = r.id
    WHERE u.email = ? AND u.is_deleted = 0
  `;

  const [result] = await db.execute(sql, [email]);
  return result[0];
}

async function getUsernameById(id) {
  const sql = `
    SELECT
      id,
      username
    FROM users
    WHERE id = ? AND is_deleted = 0
  `;

  const [result] = await db.execute(sql, [id]);
  return result[0];
}

async function getUserPassword(id) {
  const sql = `
    SELECT
      id,
      password
    FROM users
    WHERE id = ? AND is_deleted = 0
  `;

  const [result] = await db.execute(sql, [id]);
  return result[0];
}

async function createUser(username, email, password, role_id = 3) {
  // Using safe parameter placeholders (?) to avoid SQL injection
  const sql = `
    INSERT INTO users (username, email, password, role_id)
    VALUES (?, ?, ?, ?)
  `;

  const [result] = await db.execute(sql, [username, email, password, role_id]);
  return result;
}

async function updateUserPassword(id, password) {
  const sql = `
    UPDATE users
    SET password = ?
    WHERE id = ? AND is_deleted = 0
  `;

  const [result] = await db.execute(sql, [password, id]);
  return result;
}

async function updateUser(fields, values) {
  // Updates a user dynamically based on provided fields
  // Using safe parameter placeholders (?) to avoid SQL injection
  const sql = `
    UPDATE users
    SET ${fields.join(", ")}
    WHERE id = ? AND is_deleted = 0
  `;

  const [result] = await db.execute(sql, values);
  return result;
}

async function activateUser(id) {
  const sql = `
    UPDATE users
    SET active = 1
    WHERE id = ? AND is_deleted = 0 AND active = 0
  `;

  const [result] = await db.execute(sql, [id]);
  return result;
}

async function deactivateUser(id) {
  const sql = `
    UPDATE users
    SET active = 0
    WHERE id = ? AND is_deleted = 0 AND active = 1
  `;

  const [result] = await db.execute(sql, [id]);
  return result;
}

async function deleteUser(id) {
  const sql = `
    UPDATE users
    SET is_deleted = 1, active = 0
    WHERE id = ? AND is_deleted = 0
  `;

  const [result] = await db.execute(sql, [id]);
  return result;
}

export {
  getAllUsers,
  getUserById,
  getUserByUsername,
  getUserByEmail,
  getUsernameById,
  getUserPassword,
  createUser,
  updateUserPassword,
  updateUser,
  activateUser,
  deactivateUser,
  deleteUser,
};
