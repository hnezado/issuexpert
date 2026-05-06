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

async function findById(id) {
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

async function findByUsername(username) {
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

async function findByEmail(email) {
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

  const [result] = await db.execute(sql, [active, id, active]);
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
