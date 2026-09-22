import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import session from "express-session";
import MongoStore from "connect-mongo";
import passport from "passport";
import dotenv from "dotenv";
import mongoose from "mongoose";

import { configurePassport } from "./config/passport.js";
import { apiLimiter } from "./middleware/rateLimitMiddleware.js";
import { notFoundHandler, globalErrorHandler } from "./middleware/errorMiddleware.js";

// Routes
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import organizerRoutes from "./routes/organizerRoutes.js";
import eventRoutes from "./routes/eventRoutes.js";
import registrationRoutes from "./routes/registrationRoutes.js";
import savedEventRoutes from "./routes/savedEventRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import announcementRoutes from "./routes/announcementRoutes.js";
import bannerRoutes from "./routes/bannerRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";

dotenv.config();

const app = express();

// Security Headers per Section 53
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

// CORS per Section 54
const allowedOrigins = [
  process.env.CLIENT_URL || "http://localhost:3000",
  "http://localhost:5173",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:5173",
];

app.use(
  cors({
    origin: (origin, callback) => {
      // allow requests with no origin (like mobile apps, curl, postman)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV !== "production") {
        return callback(null, true);
      }
      return callback(new Error("CORS policy: Not allowed by Access-Control-Allow-Origin"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  })
);

// Body Parsers
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Request Logger
if (process.env.NODE_ENV !== "test") {
  app.use(morgan("dev"));
}

// Session Configuration per Section 4 & 53
const sessionConfig = {
  secret: process.env.SESSION_SECRET || "ignite_default_secret_key",
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  },
};

// Use MongoStore with active mongoose connection
if (process.env.NODE_ENV !== "test") {
  try {
    sessionConfig.store = MongoStore.create({
      clientPromise: new Promise((resolve) => {
        if (mongoose.connection.readyState === 1) {
          resolve(mongoose.connection.getClient());
        } else {
          mongoose.connection.once("connected", () => {
            resolve(mongoose.connection.getClient());
          });
        }
      }),
      collectionName: "sessions",
      ttl: 7 * 24 * 60 * 60,
    });
  } catch {
    // Fallback to memory session
  }
}

app.use(session(sessionConfig));

// Passport Initialization
configurePassport();
app.use(passport.initialize());
app.use(passport.session());

// Global Rate Limiter per Section 53
app.use("/api", apiLimiter);

// Health Check per Section 74
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Ignite Enginow API is running",
  });
});

// Mount Routes per Section 58
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/organizers", organizerRoutes);
app.use("/api/organizer", organizerRoutes); // alias for singular
app.use("/api/events", eventRoutes);
app.use("/api/registrations", registrationRoutes);
app.use("/api/saved-events", savedEventRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/announcements", announcementRoutes);
app.use("/api/banners", bannerRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/contact", contactRoutes);

// Error Handling per Section 51
app.use(notFoundHandler);
app.use(globalErrorHandler);

export default app;
