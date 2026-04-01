const userModel = require("../models/userModel");
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
      user: {
        id: user.id,
        username: user.username,
        role_id: user.role_id,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

module.exports = {
  login,
};
