import "dotenv/config";
import db from "../config/db.js";

async function test() {
  const [rows] = await db.query("SELECT 1 AS ok");
  console.log(rows);
}

test();
