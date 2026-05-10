import "dotenv/config";
import db from "../config/db.js";
import logger from "../utils/logger.js";

async function test() {
  const [rows] = await db.query("SELECT 1 AS ok");
  logger.info(rows);
}

test();
