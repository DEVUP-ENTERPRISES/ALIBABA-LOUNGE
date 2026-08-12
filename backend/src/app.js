const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");

const env = require("./config/env");
const apiRoutes = require("./routes");
const { notFound } = require("./middleware/notFound");
const { errorHandler } = require("./middleware/errorHandler");

const app = express();

app.set("trust proxy", 1);

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

app.use(
  cors({
    origin(origin, callback) {
      // Same-origin/server-to-server requests send no Origin header.
      if (!origin) return callback(null, true);

      const normalized = origin.replace(/\/$/, "");
      if (env.clientUrls.includes(normalized)) return callback(null, true);

      // Vercel preview deployments for this project.
      if (env.allowVercelPreviews && /^https:\/\/[a-z0-9-]+\.vercel\.app$/i.test(normalized)) {
        return callback(null, true);
      }

      // Reject by withholding the CORS headers rather than throwing — the
      // browser blocks the response, and we avoid a 500 + stack trace per hit.
      return callback(null, false);
    },
    credentials: true,
  })
);

app.use(
  rateLimit({
    windowMs: env.rateLimit.windowMs,
    // This is DoS protection, not business logic, so it has to be generous.
    // Every device in the venue shares one public IP: staff tablets polling
    // the order board, plus guests browsing and ordering. At 100 per 15
    // minutes a single worker's polling alone exhausted the whole venue's
    // budget and everyone got 429s. Login has its own tight limiter.
    max: env.rateLimit.max,
    standardHeaders: true,
    legacyHeaders: false,
    // Render's uptime probe must never be throttled.
    skip: (req) => req.path === "/health",
    message: {
      success: false,
      message: "Too many requests. Please try again later.",
    },
  })
);

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
app.use(cookieParser());

if (env.isDevelopment) {
  app.use(morgan("dev"));
}

app.get("/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "Alibaba backend is healthy.",
    environment: env.nodeEnv,
  });
});

app.use("/api", apiRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
