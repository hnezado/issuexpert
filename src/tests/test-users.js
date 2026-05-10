import userModel from "../models/userModel.js";
import logger from "../utils/logger.js";

async function test() {
  const users = await userModel.getAllUsers();
  logger.info(users);
}

test();
