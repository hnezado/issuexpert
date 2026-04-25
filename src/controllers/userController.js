import * as userModel from "../models/userModel.js";
import { hashPassword } from "../utils/password.js";

async function getAllUsers(req, res) {
  try {
    const users = await userModel.getAllUsers();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

async function getUser(req, res) {
  try {
    const user = await userModel.findById(req.body.id);
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

async function createUser(req, res) {
  try {
    const { username, email, password, role_id } = req.body;

    // Checking required fields
    if (!username || !email || !password) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Hashing password
    const hashedPassword = await hashPassword(password);

    // Create user
    const result = await userModel.createUser(
      username,
      email,
      hashedPassword,
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

export { getAllUsers, createUser, getUser };
