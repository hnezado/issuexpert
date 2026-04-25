import express from "express";
import cors from "cors";

import userRoutes from "./routes/users.js";
import authRoutes from "./routes/auth.js";
import ticketRoutes from "./routes/tickets.js";
import messageRoutes from "./routes/messages.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

// Route mounting
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/tickets", ticketRoutes);
app.use("/api/messages", messageRoutes);

app.get("/", (req, res) => {
  res.json({ message: "API running" });
});

export default app;
