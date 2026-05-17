const express = require("express");
require("dotenv").config({ path: "../../.env" });

const cors = require("cors");

const app = express();
app.use(express.json({ limit: "10mb" }));

// Configure CORS to allow the frontend (Vercel) to call this backend
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";
app.use(cors({ origin: FRONTEND_URL }));

// Use process.env.PORT when deployed on Render/Heroku
const port = process.env.PORT || process.env.backend__port || 4100;

// Reuse existing modules from other services
const storage = require("../../auth/src/lib/storage");
const { createContentRoutes } = require("../../content/src/routes/contentRoutes");
const authRoutes = require("./routes/authRoutes");
const connectorRoutes = require("./routes/connectorRoutes");

storage.ensureDataDir();

app.get("/health", (req, res) => res.json({ ok: true }));

// Mount routes using the previous BFF paths so the frontend doesn't need changes
app.use("/oauth", authRoutes);
app.use("/api/content", createContentRoutes());
app.use("/api/linkedin", connectorRoutes);

// Start worker (simple interval) in same process
try {
  const worker = require("../../worker/src/index.js");
  // worker module starts its own interval on require
} catch (err) {
  console.warn("[backend] could not start worker module: ", err.message);
}

app.listen(port, () => {
  console.log(`[backend] listening on ${port}`);
});
