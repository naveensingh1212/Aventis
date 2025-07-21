import mongoose, { Schema } from "mongoose";

const chatModelSchema = new Schema({
    chatName: { 
        type: String, 
        required: true, 
    },
    isGrouptChat:{
        type: Boolean,  
        default: false;
    },
    users: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref : "User", // Assuming your User model is named 'User'
            required: true
        },
    ],
    latestMessage: 
        {
            type :mongoose.Schema.Types.ObjectId,
            ref: "Message", // Assuming your Message model is named 'Message'
        },
        groupAdmin:{
            type:mongoose.Schema.Types.ObjectId,
            ref : "User"
        },
    


},
    {
        timestamps: true // Adds createdAt and updatedAt fields
    }
);

export const Chat = mongoose.model("Chat",chatModelSchema); 