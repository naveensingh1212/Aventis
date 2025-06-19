import { Task } from '../models/task.model.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import mongoose from 'mongoose';

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

/**
 * @desc Create a new task
 * @route POST /api/v1/tasks
 * @access Private
 */
const createTask = asyncHandler(async (req, res) => {
    const { title, description, status, priority, dueDate } = req.body;
    const owner = req.user._id; // Task owner is the authenticated user

    if (!title) {
        throw new ApiError(400, "Task title is required");
    }

    const task = await Task.create({
        title,
        description,
        status,
        priority,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        owner,
    });

    if (!task) {
        throw new ApiError(500, "Failed to create task");
    }

    return res.status(201).json(new ApiResponse(201, task, "Task created successfully"));
});

/**
 * @desc Get all tasks for the authenticated user
 * @route GET /api/v1/tasks
 * @access Private
 */
const getAllTasks = asyncHandler(async (req, res) => {
    const owner = req.user._id; // Filter tasks by authenticated user
    const { status, priority, search, sortBy, sortOrder = 'desc', page = 1, limit = 10 } = req.query;

    const query = { owner, isDeleted: false }; // Base query
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (search) {
        query.$or = [
            { title: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } },
        ];
    }

    const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        sort: sortBy ? { [sortBy]: sortOrder === 'asc' ? 1 : -1 } : { createdAt: -1 },
    };

    const tasksAggregate = Task.aggregate([
        { $match: query },
        { $sort: options.sort },
        {
            $lookup: {
                from: 'users',
                localField: 'owner',
                foreignField: '_id',
                as: 'ownerDetails'
            }
        },
        { $unwind: { path: '$ownerDetails', preserveNullAndEmptyArrays: true } },
        {
            $project: {
                _id: 1, title: 1, description: 1, status: 1, priority: 1, dueDate: 1,
                createdAt: 1, updatedAt: 1, completedAt: 1,
                'owner.username': '$ownerDetails.username',
                'owner.email': '$ownerDetails.email',
                'owner.fullName': '$ownerDetails.fullName'
            }
        }
    ]);

    const tasks = await Task.aggregatePaginate(tasksAggregate, options);

    if (!tasks) {
        throw new ApiError(500, "Failed to retrieve tasks");
    }

    return res.status(200).json(new ApiResponse(200, tasks, "Tasks retrieved successfully"));
});

/**
 * @desc Get a single task by its ID
 * @route GET /api/v1/tasks/:id
 * @access Private
 */
const getTaskById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const owner = req.user._id;

    if (!isValidObjectId(id)) {
        throw new ApiError(400, "Invalid Task ID provided");
    }

    // Find task for the authenticated user and populate owner details
    const task = await Task.findOne({ _id: id, owner, isDeleted: false })
                           .populate('owner', 'username email fullName');

    if (!task) {
        throw new ApiError(404, "Task not found or you don't have permission to access it");
    }

    return res.status(200).json(new ApiResponse(200, task, "Task retrieved successfully"));
});

/**
 * @desc Update an existing task by its ID
 * @route PUT /api/v1/tasks/:id
 * @access Private
 */
const updateTask = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { title, description, status, priority, dueDate } = req.body;
    const owner = req.user._id;

    if (!isValidObjectId(id)) {
        throw new ApiError(400, "Invalid Task ID provided");
    }

    if (!title && !description && !status && !priority && !dueDate) {
        throw new ApiError(400, "At least one field is required for update");
    }

    const updateFields = { title, description, status, priority, dueDate: dueDate ? new Date(dueDate) : undefined };

    // Handle `completedAt` timestamp based on `status` change
    if (status === 'completed') {
        const existingTask = await Task.findOne({ _id: id, owner, isDeleted: false });
        if (existingTask && existingTask.status !== 'completed') {
            updateFields.completedAt = new Date(); // Set if becoming completed
        }
    } else if (status && status !== 'completed') {
        const existingTask = await Task.findOne({ _id: id, owner, isDeleted: false });
        if (existingTask && existingTask.status === 'completed') {
            updateFields.completedAt = null; // Clear if no longer completed
        }
    }

    const task = await Task.findOneAndUpdate(
        { _id: id, owner, isDeleted: false },
        { $set: updateFields },
        { new: true, runValidators: true }
    );

    if (!task) {
        throw new ApiError(404, "Task not found or you don't have permission to update it");
    }

    return res.status(200).json(new ApiResponse(200, task, "Task updated successfully"));
});

/**
 * @desc Soft delete a task by its ID
 * @route DELETE /api/v1/tasks/:id
 * @access Private
 */
const deleteTask = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const owner = req.user._id;

    if (!isValidObjectId(id)) {
        throw new ApiError(400, "Invalid Task ID provided");
    }

    // Perform soft delete: mark as deleted and set deleted timestamp
    const task = await Task.findOneAndUpdate(
        { _id: id, owner, isDeleted: false },
        { $set: { isDeleted: true, deletedAt: new Date() } },
        { new: true }
    );

    if (!task) {
        throw new ApiError(404, "Task not found or you don't have permission to delete it");
    }

    return res.status(200).json(new ApiResponse(200, null, "Task soft deleted successfully"));
});

export {
    createTask,
    getAllTasks,
    getTaskById,
    updateTask,
    deleteTask
};







/*
 ******************************************************************************
 * MONGODB AGGREGATION PIPELINE CONCEPTS (Used in getAllTasks)
 * An aggregation pipeline processes data records into aggregated results.
 * It's like a conveyor belt where documents pass through stages, each performing an operation.
 ******************************************************************************
 */

/**
 * @function aggregate (Mongoose method)
 * @definition `Task.aggregate([...])` starts an aggregation pipeline on the `Task` collection.
 * It takes an array of pipeline stages as its argument.
 */

/**
 * @function aggregatePaginate (Mongoose-aggregate-paginate-v2 method)
 * @definition If using `mongoose-aggregate-paginate-v2`, this method (e.g., `Task.aggregatePaginate(pipeline, options)`)
 * applies pagination to the results of an aggregation pipeline, simplifying paginated queries.
 */

/**
 * @operator $match
 * @definition An aggregation pipeline stage.
 * It filters documents based on specified query conditions, similar to `find()` operation.
 * Only documents that match the criteria pass to the next stage.
 */

/**
 * @operator $sort
 * @definition An aggregation pipeline stage.
 * It reorders the documents based on the specified sort key and order (ascending/descending).
 */

/**
 * @operator $lookup
 * @definition An aggregation pipeline stage.
 * It performs a left outer join to an unsharded collection in the same database.
 * It joins documents from one collection with documents from another collection.
 * In this case, it's used to "populate" owner details from the `users` collection into task documents.
 */

/**
 * @operator $unwind
 * @definition An aggregation pipeline stage.
 * It deconstructs an array field from the input documents to output a document for each element.
 * If the array field might be missing or empty, `preserveNullAndEmptyArrays: true` ensures
 * the original document is still output, with the array field being null or undefined for that output.
 * Here, it flattens the `ownerDetails` array into a single object per task.
 */

/**
 * @operator $project
 * @definition An aggregation pipeline stage.
 * It reshapes each document in the stream, including, excluding, or renaming fields.
 * It's used to select only the necessary fields and structure the `owner` object within the task.
 */