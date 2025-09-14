import express from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  getCurrentUser,
    allUsers,
} from "../controllers/auth.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/refresh-token", refreshAccessToken);
router.get("/logout", verifyJWT, logoutUser);
router.get("/me", verifyJWT, getCurrentUser);
router.get("/getall", verifyJWT, allUsers);
export default router;
