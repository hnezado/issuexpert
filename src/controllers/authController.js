import * as userModel from "../models/userModel.js";
import * as roleModel from "../models/roleModel.js";
import { comparePassword } from "../utils/password.js";
import { generateToken } from "../utils/jwt.js";
import logger from "../utils/logger.js";

async function login(req, res) {
  try {
    const { identifier, password } = req.body;

    // Input data validation
    if (!identifier || !password) {
      logger.warn("AuthController.login: missing credentials");
      return res.status(400).json({
        message: "Missing credentials",
      });
    }

    // Checking if user exists
    let user = await userModel.findByUsername(identifier.toLowerCase());
    if (!user) {
      user = await userModel.findByEmail(identifier.toLowerCase());
    }
    if (!user) {
      logger.warn("AuthController.login: invalid user identifier");
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Validating password
    const validPassword = await comparePassword(password, user.password);
    if (!validPassword) {
      logger.warn("AuthController.login: invalid user password");
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Generate authentication JWT token (valid access to API)
    const token = generateToken(user);

    return res.json({
      message: "Login successful",
      token,
    });
  } catch (error) {
    logger.error("AuthController.login: error logging in");
    return res.status(500).json({ message: error.message });
  }
}

/**
 * Verify endpoint controller.
 * This function is executed only if authMiddleware has already validated the JWT.
 * It simply confirms that the token is valid and returns the authenticated user data.
 */
function verifyUser(req, res) {
  return res.json({
    valid: true,
    user: req.user,
  });
}

/**
 * Retrieves and return the user data when an existing ID is provided
 */
async function getUserInfo(req, res) {
  try {
    if (!req.user) {
      logger.warn("AuthController.getUserInfo: not authenticated");
      return res.status(401).json({ message: "Not authenticated" });
    }

    const user = await userModel.findById(req.user.id);
    if (!user) {
      logger.warn("AuthController.getUserInfo: user not found");
      return res.status(404).json({ message: "User not found" });
    }

    return res.json({
      message: "User found successfully",
      user: {
        username: user.username,
        email: user.email,
        role: user.role,
        active: Boolean(user.active),
      },
    });
  } catch (error) {
    logger.error(
      "AuthController.getUserInfo: error retrieving user information",
    );
    return res.status(500).json({ message: "Internal server error" });
  }
}

export { login, verifyUser, getUserInfo };
