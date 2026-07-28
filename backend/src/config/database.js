const mongoose = require("mongoose");

const env = require("./env");

async function connectDatabase() {
  mongoose.set("strictQuery", true);

  const connection = await mongoose.connect(env.mongoUri, {
    serverSelectionTimeoutMS: env.mongoServerSelectionTimeoutMs,
  });

  console.log(`MongoDB connected: ${connection.connection.host}`);
  return connection;
}

async function disconnectDatabase() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
    console.log("MongoDB disconnected.");
  }
}

module.exports = {
  connectDatabase,
  disconnectDatabase,
};
