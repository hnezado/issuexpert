async function getAllCategories() {}

async function findById(id) {}

async function createCategory(name) {
  const sql = `
    INSERT INTO categories (name)
    VALUES (?)
  `;

  const [result] = await db.execute(sql, [name]);

  return result;
}

async function updateCategory(fields, values) {
  const sql = `
    UPDATE categories
    SET ${fields.join(", ")}
    WHERE id = ?
  `;

  const [result] = await db.execute(sql, values);

  return result;
}

async function deleteCategory(id) {
  const sql = `
    UPDATE categories
    SET is_deleted = 1
    WHERE id = ? AND is_deleted = 0
  `;

  const [result] = await db.execute(sql, [id]);

  return result;
}
