import db from "../config/db.js";

async function getAllUsers() {
  const [result] = await db.execute(`
      SELECT id, username, email, role_id, created_at, active
      FROM users
      WHERE is_deleted = 0
    `);
  return result;
}

async function findById(id) {
  const sql = `
    SELECT *
    FROM users
    WHERE id = ? AND is_deleted = 0
  `;
  const [result] = await db.execute(sql, [id]);
  return result[0];
}

async function findByUsername(username) {
  const sql = `
    SELECT *
    FROM users
    WHERE username = ? AND is_deleted = 0
  `;
  const [result] = await db.execute(sql, [username]);
  return result[0];
}

async function findByEmail(email) {
  const sql = `
    SELECT *
    FROM users
    WHERE email = ? AND is_deleted = 0
  `;
  const [result] = await db.execute(sql, [email]);
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

// Updates a user dynamically based on provided fields
async function updateUser(fields, values) {
  // Using safe parameter placeholders (?) to avoid SQL injection
  const sql = `
    UPDATE users
    SET ${fields.join(", ")}
    WHERE id = ? AND is_deleted = 0
  `;

  const [result] = await db.execute(sql, values);
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

async function setUserActive(id, active) {
  const sql = `
    UPDATE users
    SET active = ?
    WHERE id = ? AND is_deleted = 0 AND active != ?
  `;

  const [result] = await db.execute(sql, [active, id]);
  return result;
}

export {
  getAllUsers,
  findById,
  findByUsername,
  findByEmail,
  createUser,
  updateUser,
  deleteUser,
  setUserActive,
};
