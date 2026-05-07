import jwt from "jsonwebtoken";
import logger from "../utils/logger.js";

/**
 * Authentication middleware that validates JWT authentication token from Authorization header.
 * If valid, attaches decoded user data to req.user and allows request to continue.
 * If invalid or missing, returns 401 Unauthorized.
 */
function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      logger.warn("AuthMiddleware: No authentication token provided");
      return res
        .status(401)
        .json({ message: "No authentication token provided" });
    }

    // Bearer authToken format (Bearer <authToken>)
    const authToken = authHeader.split(" ")[1];

    if (!authToken) {
      logger.warn("AuthMiddleware: invalid authentication token format");
      return res
        .status(401)
        .json({ message: "Invalid authentication token format" });
    }

    const decoded = jwt.verify(authToken, process.env.JWT_SECRET);

    // Attach user to request
    req.user = decoded;

    // Finish this middleware and skips to next middleware or route
    next();
  } catch (error) {
    logger.error("AuthMiddleware: invalid authentication token");
    return res.status(401).json({ message: "Invalid authentication token" });
  }
}

export default authMiddleware;
