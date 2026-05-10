import logger from "../utils/logger.js";
import { getRoleId } from "../utils/roles.js";

function roleMiddleware(allowedRoles) {
  return (req, res, next) => {
    try {
      if (!req.user) {
        logger.warn("RoleMiddleware: authentication required");
        return res.status(401).json({ message: "Authentication required" });
      }

      const userRoleId = getRoleId(req.user?.role);

      if (!allowedRoles.includes(userRoleId)) {
        logger.warn("RoleMiddleware: insufficient permissions");
        return res.status(403).json({ message: "Insufficient permissions" });
      }

      // Finish this middleware and skips to next middleware or route
      next();
    } catch (error) {
      logger.error(`RoleMiddleware: error checking permissions`);
      return res.status(500).json({ message: error.message });
    }
  };
}

export default roleMiddleware;
