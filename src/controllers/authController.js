const userModel = require("../models/userModel");
const { comparePassword } = require("../utils/password");

async function login(req, res) {
  try {
    const { usernameOrEmail, password } = req.body;

    // Checking if user exists
    let user;
    if (usernameOrEmail) {
      user = await userModel.findByUsername(usernameOrEmail);
    }
    if (!user) {
      user = await userModel.findByEmail(usernameOrEmail);
    }
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Validating password
    const validPassword = await comparePassword(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    res.json({
      message: "Login successful",
      user: {
        id: user.id,
        username: user.username,
        role_id: user.role_id,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

module.exports = {
  login,
};
