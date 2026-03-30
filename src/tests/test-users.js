const userModel = require("../models/userModel");

async function test() {
  const users = await userModel.getAllUsers();
  console.log(users);
}

test();
