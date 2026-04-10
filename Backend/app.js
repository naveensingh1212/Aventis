import dotenv from "dotenv";
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

// Route Imports
import authRoutes from "./routes/auth.routes.js";
import taskRoutes from "./routes/task.routes.js";
import codingRoutes from "./routes/coding.routes.js";
import contestRoutes from "./routes/contest.routes.js";
import chatRoutes from "./routes/chat.routes.js";
import messageRoutes from "./routes/message.routes.js";

dotenv.config();

const app = express();

// ── CORS CONFIGURATION ──────────────────────────────────────────────────────
// This setup allows your Vercel frontend to send Cookies and Authorization headers
const allowedOrigins = [
  "http://localhost:5173",                   // Local development
  "https://aventis-drab.vercel.app",         // Your specific Vercel URL
  process.env.FRONTEND_URL                   // Dynamic URL from Render Env
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or Postman)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS blocked: ${origin}`));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"]
}));

// ── MIDDLEWARES ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(cookieParser());

// ── ROUTES ──────────────────────────────────────────────────────────────────
app.use("/api/v1/auth",     authRoutes);
app.use("/api/v1/tasks",    taskRoutes);
app.use("/api/v1/coding",   codingRoutes);
app.use("/api/v1/contests", contestRoutes);
app.use("/api/v1/chat",     chatRoutes);
app.use("/api/v1/messages", messageRoutes);

// Optional: Basic Health Check
app.get("/", (req, res) => {
  res.send("Aventis API is running...");
});

export default app;