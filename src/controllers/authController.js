const userModel = require("../models/userModel");
const roleModel = require("../models/roleModel");
const { comparePassword } = require("../utils/password");
const { generateToken } = require("../utils/jwt");

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
    let user = await userModel.findByEmail(identifier);
    if (!user) {
      user = await userModel.findByUsername(identifier);
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
      return res.status(400).json({ message: "The user don't exist" });
    }

    const role = await roleModel.findById(req.user.role_id);
    if (!role) {
      return res.status(400).json({ message: "The role don't exist" });
    }

    return res.json({
      message: "User found successfully",
      user: {
        username: user.username,
        email: user.email,
        role: role.name,
        active: Boolean(user.active),
      },
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

module.exports = {
  login,
  verifyUser,
  getUserInfo,
};
