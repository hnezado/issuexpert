import * as userModel from "../models/userModel.js";
import { hashPassword } from "../utils/password.js";

// Get all users excluding soft deleted ones
async function getAllUsers(req, res) {
  try {
    const users = await userModel.getAllUsers();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// Get a single user by id
async function getUser(req, res) {
  const id = Number(req.params.id);

  if (!id) {
    return res.status(400).json({ message: "Missing user id" });
  }

  try {
    const user = await userModel.findById(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
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

    // Insert user in DB
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
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        message: "Username or email is already registered",
      });
    }

    res.status(500).json({ message: error.message });
  }
}

// Partial user update
async function updateUser(req, res) {
  try {
    const id = Number(req.params.id);

    if (!id) {
      return res.status(400).json({ message: "Missing user id" });
    }

    const { username, email, role_id } = req.body;

    const currentUser = await userModel.findById(id);

    if (!currentUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const fields = [];
    const values = [];

    // Only update changed fields
    if (username !== undefined && username !== currentUser.username) {
      fields.push("username = ?");
      values.push(username);
    }
    if (email !== undefined && email !== currentUser.email) {
      fields.push("email = ?");
      values.push(email);
    }
    if (role_id !== undefined && role_id !== currentUser.role_id) {
      fields.push("role_id = ?");
      values.push(role_id);
    }
    if (fields.length === 0) {
      return res.status(200).json({
        message: "No changes detected in user",
      });
    }

    // ID required at the end for WHERE clausule
    values.push(id);

    const result = await userModel.updateUser(fields, values);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "User updated",
    });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        message: "Username or email is already registered",
      });
    }

    res.status(500).json({ message: error.message });
  }
}

// User soft delete (is_deleted = 1)
async function deleteUser(req, res) {
  try {
    const id = Number(req.params.id);

    if (!id) {
      return res.status(400).json({ message: "Missing user id" });
    }

    const result = await userModel.deleteUser(id);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "User deleted",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

async function activateUser(req, res) {
  try {
    const id = Number(req.params.id);

    if (!id) {
      return res.status(400).json({ message: "Missing user id" });
    }

    const result = await userModel.setUserActive(id, 1);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "User activated" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

async function deactivateUser(req, res) {
  try {
    const id = Number(req.params.id);

    if (!id) {
      return res.status(400).json({ message: "Missing user id" });
    }

    const result = await userModel.setUserActive(id, 0);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "User deactivated" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export {
  getAllUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  activateUser,
  deactivateUser,
};
