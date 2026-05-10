import express from "express";
import cors from "cors";

import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import ticketRoutes from "./routes/tickets.js";
import categoryRoutes from "./routes/categories.js";
import messageRoutes from "./routes/messages.js";

import path from "path";
import { fileURLToPath } from "url";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files (frontend)
app.use(express.static("public"));

// =======================
// API ROUTES
// =======================
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/tickets", ticketRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/messages", messageRoutes);

// Health check
app.get("/api", (req, res) => {
  res.json({
    status: "ok",
    message: "API running",
    time: new Date().toISOString(),
  });
});

// =======================
// SPA FALLBACK
// =======================
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// IMPORTANT: fallback AFTER API routes
app.use((req, res, next) => {
  if (req.path.startsWith("/api")) {
    return res.status(404).json({ error: "API route not found" });
  }

  res.sendFile(path.join(__dirname, "../public/index.html"));
});

export default app;
