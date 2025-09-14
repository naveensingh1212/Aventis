import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { generateAccessAndRefreshTokens } from "../utils/generateTokens.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Chat } from "../models/chat.model.js";
const accessChat = asyncHandler(async (req, res) => {
    const { userId } = req.body;
    if (!userId) {
       throw new ApiError (400 , "user fields are required")
    }

    var isChat = await Chat.find({
        isGroupChat: false,
        $and: [
            { users: { $elemMatch: { $eq: req.user._id } } },
            { users: { $elemMatch: { $eq: userId } } },
        ],
    })
        .populate("users", "-password")
        .populate("latestMessage");

    isChat = await User.populate(isChat, {
        path    : "latestMessage.sender",
        select  : "username fullname email",
    });

    if (isChat.length > 0) {
        res.send(isChat[0]);
    } else {
        var chatData = {
            chatName: "sender",
            isGrouptChat: false,
            users: [req.user._id, userId],
        };
    try {
        const createdChat  = await Chat.create(chatData);
        const FullChat = await Chat.findOne({_id : createdChat._id}).populate("users" , "-password");
        res.status(200).send(FullChat);
        
    } catch (error) {
        throw new ApiError(400, error.message);
    }
}
});




//fetch all chat
const fetchChats = asyncHandler(async (req, res) => {
    try {
        const results = await Chat.find({
            users: { $elemMatch: { $eq: req.user._id } }
        })
        .populate("users", "-password")
        .populate("groupAdmin", "-password")
        .populate("latestMessage")
        .sort({ updatedAt: -1 });

        const populatedResults = await User.populate(results, {
            path: "latestMessage.sender",
            select: "username fullname email"
        });

        res.status(200).send(populatedResults);
    } catch (error) {
        throw new ApiError(400, error.message);
    }
});

//create group chat

const createGroupChat = asyncHandler(async (req, res) => {
    if (!req.body.users || !req.body.name) {
        return res.status(400).send({ message: "Please Fill all the fields" });
    }

    var users = JSON.parse(req.body.users);

    if (users.length < 2) {
        return res.status(400).send("More than 2 users are required to form a group chat");
    }


    users.push(req.user);

    try {
        const groupChat = await Chat.create({
            chatName: req.body.name,
            users: users,
            isGrouptChat: true,
            groupAdmin: req.user,
        });
        const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
            .populate("users", "-password")
            .populate("groupAdmin", "-password");
        res.status(200).json(fullGroupChat);
    } catch (error) {
        throw new ApiError(400, error.message);
    }   
});

//rename group
const renameGroup = asyncHandler(async (req, res) => {
    const { chatId, chatName } = req.body;  
    const updatedChat = await Chat.findByIdAndUpdate(
        chatId,
        { chatName: chatName },
        { new: true }
    )
        .populate("users", "-password")
        .populate("groupAdmin", "-password");
    if (!updatedChat) {
        res.status(404);
        throw new Error("Chat Not Found");
    }
    else {
        res.json(updatedChat);
    }
});

//remove from group
const removeFromGroup = asyncHandler(async (req, res) => {
    const { chatId, userId } = req.body;    
    const removed = await Chat.findByIdAndUpdate(
        chatId,
        {   $pull: { users: userId } },
        { new: true }
    )
        .populate("users", "-password")
        .populate("groupAdmin", "-password");   
    if (!removed) {
        res.status(404);
        throw new Error("Chat Not Found");
    }       
    else {
        res.json(removed);
    }       
}); 
//add to group
const addToGroup = asyncHandler(async (req, res) => {
    const { chatId, userId } = req.body;    
    const added = await Chat.findByIdAndUpdate(
        chatId,
        { $push: { users: userId } },   
        { new: true }
    )
        .populate("users", "-password")
        .populate("groupAdmin", "-password");   
    if (!added) {
        res.status(404);
        throw new Error("Chat Not Found");
    }           
    else {
        res.json(added);
    }       
});


export { accessChat,
    fetchChats,
    createGroupChat,
    renameGroup,
    removeFromGroup,
    addToGroup,
 };
    
