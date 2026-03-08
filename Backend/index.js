import dotenv from "dotenv";
import connectDB from "./db/connectdb.js";
import app from "./app.js";
import http from "http";
import { Server } from "socket.io";

dotenv.config();

export let io;

const DB_NAME = process.env.DB_NAME;
const PORT    = process.env.PORT || 8000;

// ── CORS origins: local + production ─────────────────────────────────────────
const allowedOrigins = [
  "http://localhost:5173",
  process.env.FRONTEND_URL,
].filter(Boolean);

connectDB(DB_NAME)
  .then(() => {

    const server = http.createServer(app);

    io = new Server(server, {
      cors: {
        origin: allowedOrigins,
        credentials: true,
      },
    });

    io.on("connection", (socket) => {
      console.log("User connected:", socket.id);

      socket.on("join chat", (chatId) => {
        socket.join(chatId);
      });

      socket.on("disconnect", () => {
        console.log("User disconnected");
      });
    });

    server.listen(PORT, () => {
      console.log(`⚙️  Server running on port: ${PORT}`);
      console.log(`✅ Allowed origins: ${allowedOrigins.join(", ")}`);
    });

  })
  .catch((err) => {
    console.log("MongoDB connection failed!!!", err);
  });