import express from "express";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.routes.js";
import taskRoutes from "./routes/task.routes.js"; // Import task routes
import cors from "cors";
dotenv.config();
const app = express();



app.use(cors({
  origin: "http://localhost:5173", // frontend URL
  credentials: true
}));


// middleware
app.use(express.json());       // To parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // To parse URL-encoded request bodies (e.g., form data)
app.use(cookieParser());       // To parse cookies

// routes
app.use("/api/v1/auth", authRoutes); // Auth routes
app.use("/api/v1/tasks", taskRoutes); // Task routes // <<< ADDED THIS LINE


export default app;