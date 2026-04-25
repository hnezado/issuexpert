import * as userModel from "../models/userModel.js";
import * as roleModel from "../models/roleModel.js";
import { comparePassword } from "../utils/password.js";
import { generateToken } from "../utils/jwt.js";

async function login(req, res) {
  try {
    const { identifier, password } = req.body;

    // Input data validation
    if (!identifier || !password) {
      return res.status(400).json({
        message: "Missing credentials",
      });
    }

    // Checking if user exists
    let user = await userModel.findByEmail(identifier.toLowerCase());
    if (!user) {
      user = await userModel.findByUsername(identifier.toLowerCase());
    }
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Validating password
    const validPassword = await comparePassword(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Generate authentication JWT token (valid access to API)
    const token = generateToken(user);

    return res.json({
      message: "Login successful",
      token,
    });
  } catch (error) {
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
    const user = await userModel.findById(req.user.id);
    if (!user) {
      return res.status(400).json({ message: "The user doesn't exist" });
    }

    const role = await roleModel.findById(req.user.role_id);
    if (!role) {
      return res.status(400).json({ message: "The role doesn't exist" });
    }

    return res.json({
      message: "User found successfully",
      user: {
        username: user.username,
        email: user.email,
        role_id: user.role_id,
        active: Boolean(user.active),
      },
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

export { login, verifyUser, getUserInfo };
