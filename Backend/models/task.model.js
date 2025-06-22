import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, "Task title is required"],
            trim: true,
            minlength: [3, "Task title must be at least 3 characters long"],
            maxlength: [100, "Task title cannot exceed 100 characters"],
        },
        description: {
            type: String,
            trim: true,
            maxlength: [500, "Task description cannot exceed 500 characters"],
        },
        status: {
            type: String,
            enum: ['pending', 'in-progress', 'completed', 'archived'],
            default: 'pending',
            required: true,
        },
        priority: {
            type: String,
            enum: ['low', 'medium', 'high', 'urgent'],
            default: 'medium',
            required: true,
        },
        dueDate: {
            type: Date,
            // Optionally add validation for future dates if needed
        },
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        completedAt: {
            type: Date,
            default: null,
        },
        // Soft delete mechanism
        isDeleted: {
            type: Boolean,
            default: false,
            select: false,
        },
        deletedAt: {
            type: Date,
            default: null,
            select: false, 
        },
    },
    {
        timestamps: true, 
    }
);

taskSchema.index({ owner: 1, status: 1 });
taskSchema.index({ title: 'text', description: 'text' }); // For text search

export const Task = mongoose.model('Task', taskSchema);