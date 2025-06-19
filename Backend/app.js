import express from "express";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.routes.js";
import taskRoutes from "./routes/task.routes.js"; // Import task routes

dotenv.config();
const app = express();

// middleware
app.use(express.json());       // To parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // To parse URL-encoded request bodies (e.g., form data)
app.use(cookieParser());       // To parse cookies

// routes
app.use("/api/v1/auth", authRoutes); // Auth routes
app.use("/api/v1/tasks", taskRoutes); // Task routes // <<< ADDED THIS LINE


export default app;