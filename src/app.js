const express = require("express");
const cors = require("cors");
const userRoutes = require("./routes/users");
const authRoutes = require("./routes/auth");
const ticketRoutes = require("./routes/tickets");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Route mounting
app.use("/api/users", userRoutes);
app.use("/api/login", authRoutes);
app.use("/api/tickets", ticketRoutes);

app.get("/", (req, res) => {
  res.json({ message: "API running" });
});

module.exports = app;
