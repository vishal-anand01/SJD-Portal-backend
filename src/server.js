import dotenv from "dotenv";
dotenv.config();

import express from "express";
import http from "http";
import path from "path";
import cors from "cors";
import { fileURLToPath } from "url";
import { connectDB } from "./config/db.js";
import logger from "./utils/logger.js";
import { Server } from "socket.io";

// 🟢 Define paths before importing app
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// ✅ Set up CORS early
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);

// ✅ Fix uploads static route before any other route
const uploadsPath = path.join(__dirname, "../uploads");
console.log("🟢 Serving uploads from:", uploadsPath);

app.use("/uploads", (req, res, next) => {
  res.setHeader(
    "Access-Control-Allow-Origin",
    process.env.FRONTEND_URL || "http://localhost:5173"
  );
  res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
  next();
});
app.use("/uploads", express.static(uploadsPath));

// ✅ Import actual app routes after static
import appRoutes from "./app.js";
app.use(appRoutes);

// ✅ Start HTTP + Socket.IO
const startServer = async () => {
  try {
    await connectDB();

    const PORT = process.env.PORT || 5000;
    const server = http.createServer(app);

    const io = new Server(server, {
      cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:5173",
        methods: ["GET", "POST", "PUT", "DELETE"],
        credentials: true,
      },
    });

    io.on("connection", (socket) => {
      logger.info(`🟢 Socket connected: ${socket.id}`);
      socket.on("complaint:update", (data) => io.emit("complaint:refresh", data));
      socket.on("disconnect", (reason) =>
        logger.info(`🔴 Socket disconnected: ${socket.id} | Reason: ${reason}`)
      );
    });

    app.set("io", io);

    server.listen(PORT, () => {
      console.log(`🚀 Server ready at http://localhost:${PORT}`);
      logger.info(`✅ Server running on port ${PORT}`);
    });
  } catch (err) {
    logger.error("❌ Failed to start server", { error: err.message });
    process.exit(1);
  }
};

startServer();
