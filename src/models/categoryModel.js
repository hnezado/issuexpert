async function getAllCategories() {
  const sql = `
    SELECT 
      id,
      name
    FROM categories
    WHERE is_deleted = 0
  `;

  const [result] = await db.execute(sql);
  return result;
}

async function getCategoriesByTicket(ticketId) {
  const sql = `
    SELECT 
      tc.ticket_id,
      c.name AS category
    FROM ticket_categories tc
    LEFT JOIN categories c ON tc.category_id = c.id AND c.is_deleted = 0
    WHERE tc.ticket_id = ?
  `;

  const [result] = await db.execute(sql, [ticketId]);
  return result;
}

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

export {
  getAllCategories,
  getCategoriesByTicket,
  createCategory,
  updateCategory,
  deleteCategory,
};
