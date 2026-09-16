import mongoose from "mongoose";
import { logger } from "../utils/logger.js";

import net from "net";

let memoryServerInstance = null;

const isMongoPortOpen = (host = "127.0.0.1", port = 27017) => {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(1500);
    socket.once("connect", () => {
      socket.destroy();
      resolve(true);
    });
    socket.once("timeout", () => {
      socket.destroy();
      resolve(false);
    });
    socket.once("error", () => {
      socket.destroy();
      resolve(false);
    });
    socket.connect(port, host);
  });
};

export const connectDB = async () => {
  let mongoUri = process.env.MONGODB_URI;

  try {
    const isLocal = !mongoUri || mongoUri.includes("localhost") || mongoUri.includes("127.0.0.1");

    if (isLocal && process.env.NODE_ENV !== "production") {
      const isReachable = await isMongoPortOpen("127.0.0.1", 27017);
      if (!isReachable) {
        logger.warn("Local MongoDB port 27017 is not active. Starting in-memory MongoDB for development...");
        const { MongoMemoryServer } = await import("mongodb-memory-server");
        memoryServerInstance = await MongoMemoryServer.create();
        mongoUri = memoryServerInstance.getUri();
        logger.info(`In-memory MongoDB started at: ${mongoUri}`);
      }
    }

    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });

    logger.info(`MongoDB connected successfully: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    logger.error(`Fatal MongoDB connection error: ${error.message}`);
    throw error;
  }
};

export const closeDB = async () => {
  try {
    await mongoose.connection.close();
    if (memoryServerInstance) {
      await memoryServerInstance.stop();
    }
    logger.info("MongoDB connection closed gracefully.");
  } catch (error) {
    logger.error(`Error closing MongoDB connection: ${error.message}`);
  }
};

// Listen for process termination signals for graceful shutdown
process.on("SIGINT", async () => {
  await closeDB();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  await closeDB();
  process.exit(0);
});
