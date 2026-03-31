const jwt = require("jsonwebtoken");

/**
 * Authentication middleware that validates JWT token from Authorization header.
 * If valid, attaches decoded user data to req.user and allows request to continue.
 * If invalid or missing, returns 401 Unauthorized.
 */
function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ message: "No token provided" });
    }

    // Bearer token format (Bearer <token>)
    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Invalid token format" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user to request
    req.user = decoded;

    // Finish this middleware and skips to next middleware or route
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
}

module.exports = authMiddleware;
