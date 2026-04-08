
import dotenv from "dotenv";
import express from "express";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.routes.js";
import taskRoutes from "./routes/task.routes.js";
import codingRoutes from "./routes/coding.routes.js";
import contestRoutes from "./routes/contest.routes.js";
import chatRoutes from "./routes/chat.routes.js";
import messageRoutes from "./routes/message.routes.js";
import cors from "cors";

dotenv.config();

const app = express();

// ── CORS: supports both local dev and production ──────────────────────────────
const allowedOrigins = [
  "http://localhost:5173",                   // local dev
  process.env.FRONTEND_URL,                  // production Vercel URL
].filter(Boolean);                           // remove undefined if not set

// app.use(cors({
//   origin: "http://localhost:5173",
//   credentials: true    ------------------->>>>>>>>> for local host
// }));

// app.use(cors({
//   origin: (origin, callback) => {
//     // allow requests with no origin (mobile apps, curl, Postman)
//     if (!origin) return callback(null, true);
//     if (allowedOrigins.includes(origin)) return callback(null, true);
//     callback(new Error(`CORS blocked: ${origin}`));
//   },
//   credentials: true,
// }));

app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api/v1/auth",     authRoutes);
app.use("/api/v1/tasks",    taskRoutes);
app.use("/api/v1/coding",   codingRoutes);
app.use("/api/v1/contests", contestRoutes);
app.use("/api/v1/chat",     chatRoutes);
app.use("/api/v1/messages", messageRoutes);

export default app;