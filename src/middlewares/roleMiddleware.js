function roleMiddleware(allowedRoles) {
  return (req, res, next) => {
    try {
      const userRole = Number(req.user?.role_id);

      if (!allowedRoles.includes(userRole)) {
        return res
          .status(403)
          .json({ message: "Forbidden: insufficient permissions" });
      }

      // Finish this middleware and skips to next middleware or route
      next();
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  };
}

module.exports = roleMiddleware;
