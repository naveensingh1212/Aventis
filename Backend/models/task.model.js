import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2"; // <--- Import the plugin

const taskSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: [3, "Title must be at least 3 characters long"], // Added minlength for consistency with frontend
      maxlength: [100, "Title cannot exceed 100 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
    status: {
      type: String,
      enum: ["pending", "completed"],
      default: "pending",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "low",
    },
    dueDate: {
      type: Date,
      default: null, // Can be null if no due date
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User", // Assuming your User model is named 'User'
      required: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
    completedAt: {
      type: Date,
      default: null, // Timestamp when task was completed
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
  }
);

// Apply the pagination plugin to the schema
taskSchema.plugin(mongooseAggregatePaginate); // <--- Apply the plugin

export const Task = mongoose.model("Task", taskSchema);
