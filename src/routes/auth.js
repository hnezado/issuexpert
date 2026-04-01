const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const authController = require("../controllers/authController");

router.post("/login", authController.login);

// Returns user info if JWT is valid (already verified by authMiddleware)
router.get("/verify", authMiddleware, authController.verify);

module.exports = router;
