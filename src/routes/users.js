const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");

const userController = require("../controllers/userController");

router.get("/", authMiddleware, userController.getAllUsers);
router.post("/new", userController.createUser);

module.exports = router;
