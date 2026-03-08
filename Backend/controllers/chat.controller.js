import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Chat } from "../models/chat.model.js";
import { Message } from "../models/message.model.js";

const accessChat = asyncHandler(async (req, res) => {
    const { userId } = req.body;
    if (!userId) throw new ApiError(400, "UserId is required");
    if (userId === req.user._id.toString())
        throw new ApiError(400, "You cannot chat with yourself");

    let isChat = await Chat.find({
        isGroupChat: false,
        $and: [
            { users: { $elemMatch: { $eq: req.user._id } } },
            { users: { $elemMatch: { $eq: userId } } },
        ],
    })
        .populate("users", "-password -refreshToken")
        .populate("latestMessage");

    isChat = await User.populate(isChat, {
        path: "latestMessage.sender",
        select: "username fullname email",
    });

    if (isChat.length > 0) return res.status(200).json(isChat[0]);

    const createdChat = await Chat.create({
        chatName: "sender",
        isGroupChat: false,
        users: [req.user._id, userId],
    });

    const fullChat = await Chat.findById(createdChat._id)
        .populate("users", "-password -refreshToken");

    res.status(200).json(fullChat);
});

// ── Fetch all chats ───────────────────────────────────────────────────────────
const fetchChats = asyncHandler(async (req, res) => {
    const results = await Chat.find({
        users: { $elemMatch: { $eq: req.user._id } },
    })
        .populate("users", "-password")
        .populate("groupAdmin", "-password")
        .populate("latestMessage")
        .sort({ updatedAt: -1 });

    const populated = await User.populate(results, {
        path: "latestMessage.sender",
        select: "username fullname email",
    });

    res.status(200).json(populated);
});

// ── DELETE chat (and all its messages) ───────────────────────────────────────
const deleteChat = asyncHandler(async (req, res) => {
    const { chatId } = req.params;

    const chat = await Chat.findById(chatId);
    if (!chat) throw new ApiError(404, "Chat not found");

    // Only a member can delete
    const isMember = chat.users.some(
        (u) => u.toString() === req.user._id.toString()
    );
    if (!isMember) throw new ApiError(403, "You are not a member of this chat");

    // Delete all messages in the chat first
    await Message.deleteMany({ chat: chatId });

    // Delete the chat
    await Chat.findByIdAndDelete(chatId);

    res.status(200).json(new ApiResponse(200, { chatId }, "Chat deleted successfully"));
});

// ── Create group chat ─────────────────────────────────────────────────────────
const createGroupChat = asyncHandler(async (req, res) => {
    const { name, users: usersJSON } = req.body;
    if (!usersJSON || !name)
        return res.status(400).json({ message: "Please fill all the fields" });

    let users = JSON.parse(usersJSON);
    if (users.length < 2)
        return res.status(400).json({ message: "At least 2 other users are required" });

    // Add the creator
    users.push(req.user._id);

    const groupChat = await Chat.create({
        chatName: name,
        users,
        isGroupChat: true,
        groupAdmin: req.user._id,
    });

    const fullGroupChat = await Chat.findById(groupChat._id)
        .populate("users", "-password")
        .populate("groupAdmin", "-password");

    res.status(200).json(fullGroupChat);
});

// ── Rename group ──────────────────────────────────────────────────────────────
const renameGroup = asyncHandler(async (req, res) => {
    const { chatId, chatName } = req.body;
    if (!chatId || !chatName) throw new ApiError(400, "Chat ID and name are required");

    const updated = await Chat.findByIdAndUpdate(
        chatId,
        { chatName },
        { new: true }
    )
        .populate("users", "-password")
        .populate("groupAdmin", "-password");

    if (!updated) throw new ApiError(404, "Chat not found");
    res.status(200).json(new ApiResponse(200, updated, "Chat renamed"));
});

// ── Remove from group ─────────────────────────────────────────────────────────
const removeFromGroup = asyncHandler(async (req, res) => {
    const { chatId, userId } = req.body;
    if (!chatId || !userId) throw new ApiError(400, "Chat ID and User ID are required");

    const removed = await Chat.findByIdAndUpdate(
        chatId,
        { $pull: { users: userId } },
        { new: true }
    )
        .populate("users", "-password")
        .populate("groupAdmin", "-password");

    if (!removed) throw new ApiError(404, "Chat not found");
    res.status(200).json(new ApiResponse(200, removed, "User removed"));
});

// ── Add to group ──────────────────────────────────────────────────────────────
const addToGroup = asyncHandler(async (req, res) => {
    const { chatId, userId } = req.body;
    if (!chatId || !userId) throw new ApiError(400, "Chat ID and User ID are required");

    const added = await Chat.findByIdAndUpdate(
        chatId,
        { $push: { users: userId } },
        { new: true }
    )
        .populate("users", "-password")
        .populate("groupAdmin", "-password");

    if (!added) throw new ApiError(404, "Chat not found");
    res.status(200).json(new ApiResponse(200, added, "User added"));
});

// ── Search users ──────────────────────────────────────────────────────────────
const searchUsers = asyncHandler(async (req, res) => {
    const keyword = req.query.search
        ? {
              $or: [
                  { username: { $regex: req.query.search, $options: "i" } },
                  { fullname: { $regex: req.query.search, $options: "i" } },
              ],
          }
        : {};

    const users = await User.find(keyword).select("-password -refreshToken");
    res.status(200).json(users);
});

export {
    accessChat,
    fetchChats,
    deleteChat,
    createGroupChat,
    renameGroup,
    removeFromGroup,
    addToGroup,
    searchUsers,
};