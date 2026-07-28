const http = require("http");

const app = require("./app");
const env = require("./config/env");
const { connectDatabase, disconnectDatabase } = require("./config/database");

let server;

async function startServer() {
  try {
    await connectDatabase();

    server = http.createServer(app);
    server.listen(env.port, () => {
      console.log(
        `Sheesh backend running in ${env.nodeEnv} mode on port ${env.port}`
      );
    });
  } catch (error) {
    console.error("Failed to start backend server:", error);
    process.exit(1);
  }
}

async function shutdown(signal) {
  console.log(`${signal} received. Shutting down backend server...`);

  if (!server) {
    await disconnectDatabase();
    process.exit(0);
  }

  server.close(async () => {
    await disconnectDatabase();
    console.log("Backend server stopped gracefully.");
    process.exit(0);
  });
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled promise rejection:", reason);
  shutdown("unhandledRejection");
});

process.on("uncaughtException", (error) => {
  console.error("Uncaught exception:", error);
  process.exit(1);
});

startServer();
