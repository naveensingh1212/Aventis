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
const allowedOrigins = [
  "http://localhost:5173",
  "https://aventis-drab.vercel.app",
  "https://aventis-git-main-naveen-singhs-projects-5177f475.vercel.app" // Added the preview URL from your screenshot
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps) or if origin is in our list
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS blocked: ' + origin));
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
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/tasks", taskRoutes);
app.use("/api/v1/coding", codingRoutes);
app.use("/api/v1/contests", contestRoutes);
app.use("/api/v1/chat", chatRoutes);
app.use("/api/v1/messages", messageRoutes);

// Health Check
app.get("/", (req, res) => res.send("Aventis Server is Live"));

// Error Handler to prevent the 500 crash on preflight
app.use((err, req, res, next) => {
  console.error("Server Error:", err.message);
  res.status(500).json({ success: false, message: err.message });
});

export default app;