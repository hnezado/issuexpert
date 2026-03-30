const express = require("express");
const cors = require("cors");
const userRoutes = require("./routes/users");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.json({ message: "API running" });
});

app.use("/api/users", userRoutes);

module.exports = app;
