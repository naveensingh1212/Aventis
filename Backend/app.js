import dotenv from "dotenv";


import express from "express";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.routes.js";
import taskRoutes from "./routes/task.routes.js";
import codingRoutes from "./routes/coding.routes.js";
import contestRoutes from "./routes/contest.routes.js";
import cors from "cors";

const app = express();

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/tasks", taskRoutes);
app.use("/api/v1/coding", codingRoutes);
app.use("/api/v1/contests", contestRoutes);

export default app;