const express = require("express");
const router = express.Router();

const messageController = require("../controllers/messageController");
const authMiddleware = require("../middlewares/authMiddleware");

router.post("/new", authMiddleware, messageController.createMessage);

module.exports = router;
