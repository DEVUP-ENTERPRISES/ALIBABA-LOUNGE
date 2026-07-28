const path = require("path");
const dotenv = require("dotenv");

dotenv.config({ path: path.resolve(__dirname, "../../.env"), quiet: true });

const nodeEnv = process.env.NODE_ENV || "development";
const jwtSecret =
  process.env.JWT_SECRET || "development-only-secret-change-before-production";

if (nodeEnv === "production" && !process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET is required when NODE_ENV is production.");
}

const env = {
  nodeEnv,
  isDevelopment: nodeEnv === "development",
  isProduction: nodeEnv === "production",
  port: Number(process.env.PORT) || 5000,
  mongoUri: process.env.MONGO_URI || "mongodb://127.0.0.1:27017/sheesh",
  mongoServerSelectionTimeoutMs:
    Number(process.env.MONGO_SERVER_SELECTION_TIMEOUT_MS) || 10000,
  clientUrl: process.env.CLIENT_URL || "http://localhost:3000",
  jwt: {
    secret: jwtSecret,
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  },
  rateLimit: {
    windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
    max: Number(process.env.RATE_LIMIT_MAX) || 100,
  },
  firebase: {
    projectId: process.env.FIREBASE_PROJECT_ID || "",
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL || "",
    // .env stores \n as literal backslash-n — convert to real newlines
    privateKey: (process.env.FIREBASE_PRIVATE_KEY || "").replace(/\\n/g, "\n"),
  },
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || "",
    apiKey:    process.env.CLOUDINARY_API_KEY    || "",
    apiSecret: process.env.CLOUDINARY_API_SECRET || "",
  },
  admin: {
    email:    process.env.ADMIN_EMAIL    || "admin@sheesh.com",
    password: process.env.ADMIN_PASSWORD || "",
    name:     process.env.ADMIN_NAME     || "Super Admin",
  },
};

module.exports = env;
