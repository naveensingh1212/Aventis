import express from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";
import {
    accessChat,
    fetchChats,
    deleteChat,
    createGroupChat,
    renameGroup,
    removeFromGroup,
    addToGroup,
    searchUsers,
} from "../controllers/chat.controller.js";

const router = express.Router();

router.get("/search",      verifyJWT, searchUsers);
router.post("/",           verifyJWT, accessChat);
router.get("/fetchchat",   verifyJWT, fetchChats);
router.delete("/:chatId",  verifyJWT, deleteChat);      // ← NEW
router.post("/group",      verifyJWT, createGroupChat);
router.put("/rename",      verifyJWT, renameGroup);
router.put("/groupadd",    verifyJWT, addToGroup);
router.put("/groupremove", verifyJWT, removeFromGroup);

export default router;