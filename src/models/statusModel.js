import db from "../config/db.js";

async function getAllStatuses() {
  const sql = `
    SELECT 
      id,
      name
    FROM ticketstatuses;
  `;

  const [result] = await db.execute(sql);
  return result;
}

export { getAllStatuses };
