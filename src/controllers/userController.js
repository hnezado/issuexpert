const userModel = require("../models/userModel");

async function getAllUsers(req, res) {
  try {
    const users = await userModel.getAllUsers();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

async function createUser(req, res) {
  try {
    const { username, email, password, role_id } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const result = await userModel.createUser(
      username,
      email,
      password,
      role_id || 3,
    );

    res.status(201).json({
      message: "User created",
      id: result.insertId,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

module.exports = {
  getAllUsers,
  createUser,
};
