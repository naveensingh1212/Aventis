import mongoose from "mongoose";

const connectDB = async (DB_NAME) => {
  try {
    const connectionInstance = await mongoose.connect(`${process.env.MONGO_URI}/${DB_NAME}`);
    console.log(`\nMongoDB is connected!! DB host ${connectionInstance.connection.host}`);
  } catch (error) {
    console.log("MongoDB connection error:", error);
    process.exit(1);
  }
};

export default connectDB;
