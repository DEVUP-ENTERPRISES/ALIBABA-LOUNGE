const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });

const mongoose = require("mongoose");
const Admin = require("../models/Admin");

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/sheesh";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@sheesh.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const ADMIN_NAME = process.env.ADMIN_NAME || "Super Admin";

if (!ADMIN_PASSWORD) {
  console.error("❌  ADMIN_PASSWORD must be set in backend/.env");
  process.exit(1);
}

const seed = async () => {
  await mongoose.connect(MONGO_URI);
  console.log("✅  Connected to MongoDB");

  const existing = await Admin.findOne({ email: ADMIN_EMAIL });
  if (existing) {
    console.log(`ℹ️   Admin already exists: ${ADMIN_EMAIL}`);
    await mongoose.disconnect();
    return;
  }

  const admin = await Admin.create({
    name: ADMIN_NAME,
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
    role: "super-admin",
  });

  console.log("✅  Admin created:");
  console.log(`    Name  : ${admin.name}`);
  console.log(`    Email : ${admin.email}`);
  console.log(`    Role  : ${admin.role}`);
  await mongoose.disconnect();
};

seed().catch((err) => {
  console.error("❌  Seed failed:", err.message);
  process.exit(1);
});
