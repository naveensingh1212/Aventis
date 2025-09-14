import express from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";
const router = express.Router();

import{
    accessChat,
    fetchChats,
    createGroupChat,
    renameGroup,
    removeFromGroup,
    addToGroup,
} from "../controllers/chat.controller.js";


router.post("/",verifyJWT, accessChat);
 router.get("/fetchchat",verifyJWT, fetchChats);
 router.put("/rename",verifyJWT, renameGroup);
 router.put("/groupremove",verifyJWT, removeFromGroup);
 router.put("/groupadd",verifyJWT, addToGroup);
 router.post("/group",verifyJWT, createGroupChat); 

export default router;
