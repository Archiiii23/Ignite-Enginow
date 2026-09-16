import app from "./app.js";
import { connectDB, closeDB } from "./config/db.js";
import { logger } from "./utils/logger.js";
import Category from "./models/Category.js";
import { seedData } from "./scripts/seed.js";

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await connectDB();

    // In development mode, auto-seed if database is freshly started and empty
    if (process.env.NODE_ENV !== "production") {
      const catCount = await Category.countDocuments();
      if (catCount === 0) {
        logger.info("Database is empty. Automatically initializing development seed records...");
        await seedData(false);
      }
    }

    const server = app.listen(PORT, () => {
      logger.info(`====================================================`);
      logger.info(`🔥 IGNITE ENGINOW REST API SERVER RUNNING`);
      logger.info(`📡 Port: ${PORT}`);
      logger.info(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
      logger.info(`🚀 Health check: http://localhost:${PORT}/api/health`);
      logger.info(`====================================================`);
    });

    const handleGracefulShutdown = async (signal) => {
      logger.info(`Received ${signal}. Shutting down HTTP server gracefully...`);
      server.close(async () => {
        logger.info("HTTP server closed.");
        await closeDB();
        process.exit(0);
      });

      // Force shutdown after 10s if hanging
      setTimeout(() => {
        logger.error("Forced shutdown due to timeout.");
        process.exit(1);
      }, 10000);
    };

    process.on("SIGINT", () => handleGracefulShutdown("SIGINT"));
    process.on("SIGTERM", () => handleGracefulShutdown("SIGTERM"));
  } catch (error) {
    logger.error("Fatal error during server startup:", error);
    process.exit(1);
  }
}

startServer();
