import { Router } from 'express';
import {
    createTask,
    getAllTasks,
    getTaskById,
    updateTask,
    deleteTask
} from '../controllers/task.controller.js';
import { verifyJWT } from '../middleware/auth.middleware.js'; // Your auth middleware

const router = Router();

// Apply verifyJWT middleware to all task routes
// This ensures that only authenticated users (via your auth controller's login/refresh flow)
// can access these task functionalities. req.user will be available in the controllers.
router.use(verifyJWT);

router.route("/")
    .post(createTask)
    .get(getAllTasks);

router.route("/:id")
    .get(getTaskById)
    .put(updateTask)
    .delete(deleteTask);

export default router;