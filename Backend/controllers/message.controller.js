import { Message }      from "../models/message.model.js";
import { Chat }         from "../models/chat.model.js";
import { ApiError }     from "../utils/ApiError.js";
import { ApiResponse }  from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { io }           from "../index.js";

// POST /api/v1/messages
const sendMessage = asyncHandler(async (req, res) => {
  const { chatId, content } = req.body;

  if (!chatId || !content)
    throw new ApiError(400, "chatId and content are required");

  const message = await Message.create({
    sender: req.user._id,
    content: content.trim(),
    chat: chatId,
  });

  const fullMessage = await Message.findById(message._id)
    .populate("sender", "fullname username email")
    .populate({
      path: "chat",
      populate: {
        path: "users",
        select: "-password -refreshToken",
      },
    });

  await Chat.findByIdAndUpdate(chatId, {
    latestMessage: message._id,
  });

  io.to(chatId).emit("message received", fullMessage);

  res.status(201).json(new ApiResponse(201, fullMessage, "Message sent"));
});

// GET /api/v1/messages/:chatId
const getMessages = asyncHandler(async (req, res) => {
  const messages = await Message.find({ chat: req.params.chatId })
    .populate("sender", "fullname username email")
    .populate("chat")
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();

  res.status(200).json(new ApiResponse(200, messages.reverse(), "Messages fetched"));
}); // ← FIX: this closing }); was missing

export { sendMessage, getMessages };