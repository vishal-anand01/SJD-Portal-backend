// backend/src/app.js
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import mongoSanitize from "express-mongo-sanitize";
import sanitizeHtml from "sanitize-html"; // ✅ Safe replacement for xss-clean
import hpp from "hpp";
import compression from "compression";
import morgan from "morgan";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

import logger from "./utils/logger.js";
import errorHandler from "./middleware/errorHandler.js";

// 🧩 Load environment variables
dotenv.config();

const app = express();

// ESM safe dirname resolution
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ====================================================
// ⚙️ GLOBAL MIDDLEWARES & SECURITY
// ====================================================

// Trust reverse proxy (useful for deployment)
app.set("trust proxy", 1);

// 🛡️ Secure HTTP headers
app.use(helmet());

// 🌐 Enable CORS for frontend
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  })
);

// 🧾 Body parsers
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ====================================================
// 🧼 SANITIZATION & SECURITY
// ====================================================

// Prevent NoSQL Injection (Express 5 safe)
app.use((req, res, next) => {
  try {
    mongoSanitize({ replaceWith: "_" })(req, res, next);
  } catch (err) {
    next();
  }
});

// 🧩 Safe XSS sanitization (replaces xss-clean)
app.use((req, res, next) => {
  const sanitizeInput = (obj) => {
    for (const key in obj) {
      if (typeof obj[key] === "string") {
        obj[key] = sanitizeHtml(obj[key], {
          allowedTags: [],
          allowedAttributes: {},
        });
      } else if (typeof obj[key] === "object" && obj[key] !== null) {
        sanitizeInput(obj[key]);
      }
    }
  };
  if (req.body) sanitizeInput(req.body);
  if (req.query) sanitizeInput(req.query);
  if (req.params) sanitizeInput(req.params);
  next();
});

// Prevent HTTP param pollution & compress responses
app.use(hpp());
app.use(compression());

// 🪵 Dev request logging
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// ====================================================
// 🧨 RATE LIMITING
// ====================================================
const apiLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 mins
  max: 300,
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api", apiLimiter);

// ====================================================
// 📦 ROUTES
// ====================================================
import authRoutes from "./routes/authRoutes.js";
import complaintRoutes from "./routes/complaintRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import publicRoutes from "./routes/publicRoutes.js";
import dmRoutes from "./routes/dmRoutes.js";
import departmentRoutes from "./routes/departmentRoutes.js";
import officerRoutes from "./routes/officerRoutes.js";
import superAdminRoutes from "./routes/superAdminRoutes.js";
import lgdRoutes from "./routes/lgdRoutes.js";

app.use("/api/auth", authRoutes);
app.use("/api/complaints", complaintRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/public", publicRoutes);
app.use("/api/officer", officerRoutes);
app.use("/api/department", departmentRoutes);
app.use("/api/dm", dmRoutes);
app.use("/api/superadmin", superAdminRoutes);

// Route for LGD data
app.use("/api/lgd", lgdRoutes);

// ====================================================
// 💓 HEALTH CHECK
// ====================================================
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// ====================================================
// 🧱 SERVE FRONTEND (Production Build)
// ====================================================
if (process.env.NODE_ENV === "production") {
  const frontendPath = path.join(__dirname, "..", "frontend", "dist");
  app.use(express.static(frontendPath));

  // ✅ Safe fallback for SPA routing
  app.use((req, res, next) => {
    if (req.method === "GET" && !req.path.startsWith("/api")) {
      res.sendFile(path.join(frontendPath, "index.html"));
    } else {
      next();
    }
  });
}

// ====================================================
// ❗ ERROR HANDLING
// ====================================================

// 404 - Not Found
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `❌ Route not found: ${req.originalUrl}`,
  });
});

// Global Error Middleware (last)
app.use(errorHandler);

// ====================================================
// ✅ EXPORT APP
// ====================================================
export default app;
