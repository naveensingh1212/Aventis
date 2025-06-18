import mongoose, {Schema} from "mongoose";
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"

const userSchema =  new Schema(
    {
         username: { 
            type: String, 
            required: true, 
            unique: true, 
            lowercase: true, 
            trim: true, 
            index: true // Makes username searchable
        },
         email: { 
            type: String, 
            required: true, 
            unique: true, 
            lowercase: true, 
            trim: true, 
        },
        fullname : { 
            type: String, 
            required: true,  
            trim: true, 
            index: true // Makes username searchable
        },
        password: { 
            type: String, 
            required: [true, 'Password is required'] 
        },
        refreshToken: { 
            type: String // Stores user's refresh token
        }
    },
    {
        timestamps:true
    }
);

userSchema.pre("save" , async function (next) {
    if(!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password,10)
    next();
});

userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password,this.password)
}

userSchema.methods.generateAccessToken = function(){
    return jwt.sign(
        {
            _id : this._id,
            email: this.email,
            username: this.username,
            fullName: this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY // Token expiry duration
        }
    );
};

// Method to generate refresh token
userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            _id: this._id
        },
        process.env.REFRESH_TOKEN_SECRET, // Secret key for refresh token
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY // Token expiry duration
        }
    );
};

export const User = mongoose.model("user" , userSchema);