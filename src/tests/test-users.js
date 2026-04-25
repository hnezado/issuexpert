import userModel from "../models/userModel.js";

async function test() {
  const users = await userModel.getAllUsers();
  console.log(users);
}

test();
