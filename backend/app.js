const express = require("express");
const cors = require("cors");
const generateRoutes = require("./routes/generate.routes");
const watchedRoutes = require("./routes/watched.routes");
const gameRoutes = require("./routes/game.routes");
const exploreRoutes = require("./routes/explore.routes");
const providersRoutes = require("./routes/providers.routes");
const errorHandler = require("./middleware/errorHandler");

const app = express();

// ── Middleware ──────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ── Routes ─────────────────────────────────────────────────────────────
app.use("/api", generateRoutes);
app.use("/api", watchedRoutes);
app.use("/api", gameRoutes);
app.use("/api", exploreRoutes);
app.use("/api", providersRoutes);

// ── Error handler (must be last) ───────────────────────────────────────
app.use(errorHandler);

module.exports = app;
