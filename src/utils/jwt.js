const jwt = require("jsonwebtoken");

function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      role_id: user.role_id,
    },
    process.env.JWT_SECRET,
    { expiresIn: "1d" },
  );
}

module.exports = {
  generateToken,
};
