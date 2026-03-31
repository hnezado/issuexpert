const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");

const userController = require("../controllers/userController");

router.get(
  "/",
  authMiddleware,
  roleMiddleware([1]),
  userController.getAllUsers,
);
router.post("/new", userController.createUser);

module.exports = router;
