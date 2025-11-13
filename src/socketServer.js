// backend/src/socketServer.js
import { Server } from "socket.io";

let io;

export function initSocketServer(httpServer) {
  io = new Server(httpServer, {
    cors: { origin: process.env.FRONTEND_URL, credentials: true },
  });
  console.log("✅ Socket.IO initialized");

  io.on("connection", (socket) => {
    console.log(`🔌 Socket connected: ${socket.id}`);
    socket.on("disconnect", () => console.log(`❌ Disconnected: ${socket.id}`));
  });

  return io;
}

export function getIO() {
  if (!io) throw new Error("Socket.io not initialized");
  return io;
}

export function emitToUser(userId, event, data) {
  if (!io) return;
  // Assuming you store sockets with userId mapping elsewhere
  io.to(userId).emit(event, data);
}
