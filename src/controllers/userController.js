import * as userModel from "../models/userModel.js";
import logger from "../utils/logger.js";
import { getRoleId } from "../utils/roles.js";
import { hashPassword } from "../utils/password.js";

// Get all users excluding soft deleted ones
async function getAllUsers(req, res) {
  try {
    const users = await userModel.getAllUsers();
    res.status(200).json(users);
  } catch (error) {
    logger.error("UserController.getAllUsers: error retrieving users", {
      error,
    });
    res.status(500).json({ message: "Internal server error" });
  }
}

// Get a single user by id
async function getUserById(req, res) {
  const id = Number(req.params.id);
  const requesterRole = req.user.role;

  if (!id) {
    logger.warn("UserController.getUserById: missing user id");
    return res.status(400).json({ message: "Missing user id" });
  }

  try {
    const user = await userModel.getUserById(id);

    if (!user) {
      logger.warn("UserController.getUserById: user not found");
      return res.status(404).json({ message: "User not found" });
    }

    // Role restriction
    if (requesterRole === "technician" && user.role !== "user") {
      logger.warn("UserController.getUserById: forbidden access");
      return res.status(403).json({ message: "Forbidden" });
    }

    res.status(200).json(user);
  } catch (error) {
    logger.error("UserController.getUserById: error retrieving user", {
      error,
    });
    res.status(500).json({ message: "Internal server error" });
  }
}

// Get a single user by username
async function getUserByUsername(req, res) {
  const username = req.params.username;
  const requesterRole = req.user.role;

  if (!username) {
    logger.warn("UserController.getUserByUsername: missing username");
    return res.status(400).json({ message: "Missing username" });
  }

  try {
    const user = await userModel.getUserByUsername(username);

    if (!user) {
      logger.warn("UserController.getUserByUsername: user not found");
      return res.status(404).json({ message: "User not found" });
    }

    // Role restriction
    if (requesterRole === "technician" && user.role !== "user") {
      logger.warn("UserController.getUserByUsername: forbidden access");
      return res.status(403).json({ message: "Forbidden" });
    }

    res.status(200).json(user);
  } catch (error) {
    logger.error("UserController.getUserByUsername: error retrieving user", {
      error,
    });
    res.status(500).json({ message: "Internal server error" });
  }
}

// Get a single user by email
async function getUserByEmail(req, res) {
  const email = req.params.email;
  const requesterRole = req.user.role;

  if (!email) {
    logger.warn("UserController.getUserByEmail: missing email");
    return res.status(400).json({ message: "Missing email" });
  }

  try {
    const user = await userModel.getUserByEmail(email);

    if (!user) {
      logger.warn("UserController.getUserByEmail: user not found");
      return res.status(404).json({ message: "User not found" });
    }

    // Role restriction
    if (requesterRole === "technician" && user.role !== "user") {
      logger.warn("UserController.getUserByEmail: forbidden access");
      return res.status(403).json({ message: "Forbidden" });
    }

    res.status(200).json(user);
  } catch (error) {
    logger.error("UserController.getUserByEmail: error retrieving user", {
      error,
    });
    res.status(500).json({ message: "Internal server error" });
  }
}

async function createUser(req, res) {
  try {
    const { username, email, password, role } = req.body;

    // Checking required fields
    if (!username || !email || !password) {
      logger.warn("UserController.createUser: missing required fields", {
        username,
        email,
        password,
      });
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Hashing password
    const hashedPassword = await hashPassword(password);

    // Insert user in DB
    const result = await userModel.createUser(
      username,
      email,
      hashedPassword,
      getRoleId(role) || getRoleId("user"),
    );

    res.status(201).json({
      message: "User created",
      id: result.insertId,
    });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      logger.error(
        "UserController.createUser: username or email is already registered",
      );
      return res.status(409).json({
        message: "Username or email is already registered",
      });
    }

    res.status(500).json({ message: "Internal server error" });
  }
}

// Partial user update
async function updateUser(req, res) {
  try {
    const id = Number(req.params.id);

    if (!id) {
      logger.warn("UserController.updateUser: missing user id");
      return res.status(400).json({ message: "Missing user id" });
    }

    const { username, email, role } = req.body;

    const user = await userModel.getUserById(id);

    if (!user) {
      logger.warn("UserController.updateUser: user not found");
      return res.status(404).json({ message: "User not found" });
    }

    const fields = [];
    const values = [];

    // Only update changed fields
    if (username !== undefined && username !== user.username) {
      fields.push("username = ?");
      values.push(username);
    }
    if (email !== undefined && email !== user.email) {
      fields.push("email = ?");
      values.push(email);
    }
    if (role !== undefined && role !== user.role) {
      fields.push("role_id = ?");
      values.push(getRoleId(role));
    }
    if (fields.length === 0) {
      logger.info(
        "UserController.updateUser: no changes detected updating user",
      );
      return res.status(200).json({
        message: "No changes detected updating user",
      });
    }

    // ID required at the end for WHERE clausule
    values.push(id);

    const result = await userModel.updateUser(fields, values);

    if (result.affectedRows === 0) {
      logger.info("UserController.updateUser: no changes applied on user");
      return res.status(200).json({ message: "No changes applied on user" });
    }

    res.status(200).json({
      message: "User updated",
    });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      logger.error(
        "UserController.updateUser: username or email is already registered",
      );
      return res.status(409).json({
        message: "Username or email is already registered",
      });
    }

    res.status(500).json({ message: "Internal server error" });
  }
}

async function activateUser(req, res) {
  try {
    const id = Number(req.params.id);

    if (!id) {
      logger.warn("UserController.activateUser: missing user id");
      return res.status(400).json({ message: "Missing user id" });
    }

    const result = await userModel.activateUser(id);

    if (result.affectedRows === 0) {
      logger.info("UserController.activateUser: no changes applied on user");
      return res.status(200).json({ message: "No changes applied on user" });
    }

    res.status(200).json({ message: "User activated" });
  } catch (error) {
    logger.error("UserController.activateUser: error activating user", {
      error,
    });
    res.status(500).json({ message: "Internal server error" });
  }
}

async function deactivateUser(req, res) {
  try {
    const id = Number(req.params.id);

    if (!id) {
      logger.warn("UserController.deactivateUser: missing user id");
      return res.status(400).json({ message: "Missing user id" });
    }

    const result = await userModel.deactivateUser(id);

    if (result.affectedRows === 0) {
      logger.info("UserController.deactivateUser: no changes applied on user");
      return res.status(200).json({ message: "No changes applied on user" });
    }

    res.status(200).json({ message: "User deactivated" });
  } catch (error) {
    logger.error("UserController.deactivate: error deactivating user", {
      error,
    });
    res.status(500).json({ message: "Internal server error" });
  }
}

// User soft delete (is_deleted = 1)
async function deleteUser(req, res) {
  try {
    const id = Number(req.params.id);

    if (!id) {
      logger.warn("UserController.deleteUser: missing user id");
      return res.status(400).json({ message: "Missing user id" });
    }

    const result = await userModel.deleteUser(id);

    if (result.affectedRows === 0) {
      logger.info("UserController.deleteUser: no changes applied on user");
      return res.status(200).json({ message: "No changes applied on user" });
    }

    res.status(200).json({
      message: "User deleted",
    });
  } catch (error) {
    logger.error("UserController.deleteUser: error deleting user", {
      error,
    });
    res.status(500).json({ message: "Internal server error" });
  }
}

export {
  getAllUsers,
  getUserById,
  getUserByUsername,
  getUserByEmail,
  createUser,
  updateUser,
  activateUser,
  deactivateUser,
  deleteUser,
};
