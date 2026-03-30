require("dotenv").config();

const db = require("./config/db");

async function test() {
  const [rows] = await db.query("SELECT 1 AS ok");
  console.log(rows);
}

test();
