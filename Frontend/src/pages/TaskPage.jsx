// src/pages/TaskPage.jsx
import React, { useState, useEffect } from 'react';
import { Plus, Check, Clock, Calendar, XCircle, Loader2, Trash2 } from 'lucide-react'; // Added Trash2 icon
import { motion, AnimatePresence } from 'framer-motion'; // Added AnimatePresence for exit animations
import { useNavigate } from 'react-router-dom';

// --- Helper IconButton Component ---
// This component provides a consistent style for interactive icons.
const IconButton = ({ icon: Icon, onClick, className = '', label = '', ...props }) => (
  <motion.button
    whileHover={{ scale: 1.1 }}
    whileTap={{ scale: 0.9 }}
    onClick={onClick}
    className={`p-1 rounded-full flex items-center justify-center transition-colors duration-200 ${className}`}
    aria-label={label}
    {...props}
  >
    <Icon size={18} />
  </motion.button>
);

// --- Helper Task Card Component ---
// This component displays an individual task item with the frosted glass effect.
const TaskItemCard = ({ task, toggleCompletion, getPriorityColor, handleDeleteClick }) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={`
        backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-5
        hover:bg-white/10 transition-all duration-300 hover:scale-[1.02]
        hover:shadow-xl hover:shadow-slate-900/20 border-l-4 ${getPriorityColor(task.priority)}
        ${task.completed ? 'opacity-60' : ''}
      `}
    >
      <div className="flex items-start space-x-4">
        <button
          onClick={() => toggleCompletion(task._id, task.completed)} // Use _id from backend
          className={`mt-1 w-6 h-6 rounded-lg border-2 flex items-center justify-center
                      transition-all duration-300 hover:scale-110 ${
                        task.completed
                          ? 'bg-emerald-500/80 border-emerald-400 text-white'
                          : 'border-slate-400/60 hover:border-indigo-400/80 hover:bg-indigo-500/20'
                      }`}
        >
          {task.completed && <Check className="w-4 h-4" />}
        </button>

        <div className="flex-1 min-w-0">
          <h3 className={`text-lg font-medium mb-2 transition-all duration-300 ${
            task.completed ? 'text-slate-400 line-through' : 'text-white'
          }`}>
            {task.title}
          </h3>
          <p className={`text-sm mb-3 transition-all duration-300 ${
            task.completed ? 'text-slate-500' : 'text-slate-300'
          }`}>
            {task.description}
          </p>
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 bg-slate-800/50 px-2 py-1 rounded-lg">
              {task.dueDate ? new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'No Due Date'}
            </span>
            <span className={`text-xs px-2 py-1 rounded-lg font-medium ${
              task.priority === 'high' ? 'bg-red-500/20 text-red-300' :
              task.priority === 'medium' ? 'bg-amber-500/20 text-amber-300' :
              'bg-emerald-500/20 text-emerald-300'
            }`}>
              {task.priority ? task.priority.toUpperCase() : 'N/A'}
            </span>
          </div>
        </div>
        {/* Delete Button */}
        <IconButton
          icon={Trash2}
          onClick={() => handleDeleteClick(task._id)}
          className="text-red-400 hover:bg-red-500/20 ml-4"
          label="Delete Task"
        />
      </div>
    </motion.div>
  );
};
// --- End Helper Task Card Component ---


const TaskPage = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [token, setToken] = useState(null);
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState('low');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [taskToDeleteId, setTaskToDeleteId] = useState(null);

  const navigate = useNavigate();

  // Effect to retrieve JWT from localStorage on component mount
  useEffect(() => {
    const storedToken = localStorage.getItem('accessToken');
    if (storedToken) {
      setToken(storedToken);
      console.log("Access token retrieved from localStorage.");
    } else {
      console.warn("No access token found in localStorage. Redirecting to login.");
      navigate('/');
    }
  }, [navigate]);

  // Fetch tasks when component mounts or token changes
  useEffect(() => {
    const fetchTasks = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/v1/tasks', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          const errorData = await response.json();
          if (response.status === 401 || response.status === 403) {
             console.error("Authentication expired or invalid. Redirecting to login.");
             localStorage.removeItem('accessToken');
             navigate('/');
             return;
          }
          throw new Error(errorData.message || 'Failed to fetch tasks');
        }

        const result = await response.json();
        setTasks(result.data.docs || []);
      } catch (err) {
        console.error("Error fetching tasks:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [token, navigate]);

  const toggleTaskCompletion = async (taskId, currentCompletedStatus) => {
    if (!token) {
      setError("Authentication token missing. Cannot update task. Please log in.");
      navigate('/');
      return;
    }
    const newStatus = currentCompletedStatus ? 'pending' : 'completed';

    setTasks(prevTasks =>
      prevTasks.map(task =>
        task._id === taskId ? { ...task, completed: !currentCompletedStatus, status: newStatus } : task
      )
    );

    try {
      const response = await fetch(`/api/v1/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        const errorData = await response.json();
         if (response.status === 401 || response.status === 403) {
            console.error("Authentication expired or invalid during update. Redirecting to login.");
            localStorage.removeItem('accessToken');
            navigate('/');
            return;
         }
        throw new Error(errorData.message || 'Failed to update task status');
      }
    } catch (err) {
      console.error("Error updating task status:", err);
      setError(err.message);
      setTasks(prevTasks =>
        prevTasks.map(task =>
          task._id === taskId ? { ...task, completed: currentCompletedStatus, status: currentCompletedStatus ? 'completed' : 'pending' } : task
        )
      );
    }
  };

  const handleNewTaskSubmit = async (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || newTaskTitle.trim().length < 3) {
      setError("Task title is required and must be at least 3 characters long.");
      return;
    }
    if (!token) {
      setError("Authentication token missing. Cannot add task. Please log in.");
      navigate('/');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/v1/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: newTaskTitle,
          description: newTaskDescription,
          priority: newTaskPriority,
          dueDate: newTaskDueDate || undefined,
          status: 'pending'
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
         if (response.status === 401 || response.status === 403) {
            console.error("Authentication expired or invalid during add. Redirecting to login.");
            localStorage.removeItem('accessToken');
            navigate('/');
            return;
         }
        throw new Error(errorData.message || 'Failed to add task');
      }

      const result = await response.json();
      setTasks(prevTasks => [...prevTasks, result.data]);
      setShowAddTaskModal(false);
      setNewTaskTitle('');
      setNewTaskDescription('');
      setNewTaskPriority('low');
      setNewTaskDueDate('');
    } catch (err) {
      console.error("Error adding task:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Function to handle delete button click (opens confirmation modal)
  const handleDeleteClick = (taskId) => {
    setTaskToDeleteId(taskId);
    setShowConfirmModal(true);
  };

  // Function to confirm and execute deletion
  const confirmDeleteTask = async () => {
    if (!token || !taskToDeleteId) {
      setError("Authentication token or task ID missing. Cannot delete task. Please log in.");
      setShowConfirmModal(false);
      navigate('/');
      return;
    }

    setLoading(true);
    setError(null);
    setShowConfirmModal(false); // Close modal immediately

    try {
      const response = await fetch(`/api/v1/tasks/${taskToDeleteId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 401 || response.status === 403) {
           console.error("Authentication expired or invalid during delete. Redirecting to login.");
           localStorage.removeItem('accessToken');
           navigate('/');
           return;
        }
        throw new Error(errorData.message || 'Failed to delete task');
      }

      // Optimistically remove the task from the state
      setTasks(prevTasks => prevTasks.filter(task => task._id !== taskToDeleteId));
      setTaskToDeleteId(null); // Clear ID after deletion
    } catch (err) {
      console.error("Error deleting task:", err);
      setError(err.message);
      // If deletion failed, you might want to re-fetch tasks or add the task back to state
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'border-l-red-400/60';
      case 'medium': return 'border-l-amber-400/60';
      case 'low': return 'border-l-emerald-400/60';
      default: return 'border-l-slate-400/60';
    }
  };

  // REFINED FILTERING LOGIC:
  const currentTasks = tasks.filter(task =>
    task.status === 'pending' && (!task.dueDate || new Date(task.dueDate).setHours(0,0,0,0) <= new Date().setHours(0,0,0,0))
  ).sort((a, b) => new Date(a.dueDate || 0) - new Date(b.dueDate || 0)); // Sort by due date (0 for no due date)

  const upcomingTasks = tasks.filter(task =>
    task.status === 'pending' && task.dueDate && new Date(task.dueDate).setHours(0,0,0,0) > new Date().setHours(0,0,0,0)
  ).sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate)); // Sort by future due date


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-slate-900/40 to-slate-900"></div>
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl"></div>

      <div className="relative z-10 container mx-auto px-6 py-8 max-w-6xl">
        {/* Header Section */}
        <div className="mb-12">
          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-8 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-light text-white mb-2 tracking-wide">
                  Task Management
                </h1>
                <p className="text-slate-300 text-lg font-light">
                  Focus on what matters most
                </p>
              </div>
              <button
                onClick={() => setShowAddTaskModal(true)}
                className="bg-gradient-to-r from-indigo-500/80 to-violet-500/80 hover:from-indigo-500 hover:to-violet-500
                           border-0 backdrop-blur-sm text-white px-6 py-3 rounded-2xl transition-all duration-300
                           hover:scale-105 hover:shadow-xl hover:shadow-indigo-500/25 group flex items-center"
              >
                <Plus className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform duration-300" />
                Add New Task
              </button>
            </div>
          </div>
        </div>

        {/* Loading and Error States */}
        {loading && (
          <div className="flex items-center justify-center text-white text-xl p-8">
            <Loader2 className="animate-spin mr-3" size={24} /> Loading tasks...
          </div>
        )}
        {error && (
          <div className="bg-red-600/20 text-red-300 p-4 rounded-lg flex items-center justify-center space-x-2">
            <XCircle size={20} />
            <span>Error: {error}</span>
          </div>
        )}

        {/* Task Sections */}
        <AnimatePresence> {/* Enable exit animations for tasks */}
          {token && !loading && !error && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Current Tasks Section */}
              <div className="space-y-6">
                <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 shadow-xl">
                  <div className="flex items-center mb-6">
                    <Clock className="w-6 h-6 text-indigo-400 mr-3" />
                    <h2 className="text-2xl font-light text-white tracking-wide">Current Tasks</h2>
                    <div className="ml-auto bg-indigo-500/20 text-indigo-300 px-3 py-1 rounded-full text-sm font-medium">
                      {currentTasks.length} active
                    </div>
                  </div>

                  <div className="space-y-4">
                    {currentTasks.length > 0 ? (
                      currentTasks.map(task => (
                        <TaskItemCard
                          key={task._id}
                          task={task}
                          toggleCompletion={toggleTaskCompletion}
                          getPriorityColor={getPriorityColor}
                          handleDeleteClick={handleDeleteClick} // Pass delete handler
                        />
                      ))
                    ) : (
                      <p className="text-slate-400 text-center py-4">No current tasks. Time to add some!</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Upcoming Tasks Section */}
              <div className="space-y-6">
                <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 shadow-xl">
                  <div className="flex items-center mb-6">
                    <Calendar className="w-6 h-6 text-violet-400 mr-3" />
                    <h2 className="text-2xl font-light text-white tracking-wide">Upcoming Tasks</h2>
                    <div className="ml-auto bg-violet-500/20 text-violet-300 px-3 py-1 rounded-full text-sm font-medium">
                      {upcomingTasks.length} scheduled
                    </div>
                  </div>

                  <div className="space-y-4">
                    {upcomingTasks.length > 0 ? (
                      upcomingTasks.map(task => (
                        <TaskItemCard
                          key={task._id}
                          task={task}
                          toggleCompletion={toggleTaskCompletion}
                          getPriorityColor={getPriorityColor}
                          handleDeleteClick={handleDeleteClick} // Pass delete handler
                        />
                      ))
                    ) : (
                      <p className="text-slate-400 text-center py-4">No upcoming tasks. Enjoy the break!</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </AnimatePresence>

        {/* Quick Stats */}
        {token && !loading && !error && (
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 text-center">
              <div className="text-3xl font-light text-emerald-400 mb-2">
                {tasks.filter(task => task.status === 'completed').length}
              </div>
              <div className="text-slate-300 font-medium">Completed Total</div>
            </div>
            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 text-center">
              <div className="text-3xl font-light text-indigo-400 mb-2">
                {tasks.filter(task => task.status === 'pending').length}
              </div>
              <div className="text-slate-300 font-medium">In Progress</div>
            </div>
            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 text-center">
              <div className="text-3xl font-light text-violet-400 mb-2">
                {tasks.length}
              </div>
              <div className="text-slate-300 font-medium">Total Tasks</div>
            </div>
          </div>
        )}
      </div>

      {/* Add New Task Modal */}
      <AnimatePresence>
        {showAddTaskModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="backdrop-blur-xl bg-slate-800/60 border border-slate-700/50 rounded-2xl p-8 shadow-2xl w-full max-w-md"
            >
              <h2 className="text-2xl font-light text-white mb-6">Add New Task</h2>
              <form onSubmit={handleNewTaskSubmit} className="space-y-4">
                <div>
                  <label htmlFor="taskTitle" className="block text-slate-300 text-sm font-medium mb-1">Title</label>
                  <input
                    type="text"
                    id="taskTitle"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    className="w-full p-3 rounded-lg bg-slate-700/50 border border-slate-600/50 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="taskDescription" className="block text-slate-300 text-sm font-medium mb-1">Description (Optional)</label>
                  <textarea
                    id="taskDescription"
                    value={newTaskDescription}
                    onChange={(e) => setNewTaskDescription(e.target.value)}
                    className="w-full p-3 rounded-lg bg-slate-700/50 border border-slate-600/50 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    rows="3"
                  ></textarea>
                </div>
                <div>
                  <label htmlFor="taskPriority" className="block text-slate-300 text-sm font-medium mb-1">Priority</label>
                  <select
                    id="taskPriority"
                    value={newTaskPriority}
                    onChange={(e) => setNewTaskPriority(e.target.value)}
                    className="w-full p-3 rounded-lg bg-slate-700/50 border border-slate-600/50 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="taskDueDate" className="block text-slate-300 text-sm font-medium mb-1">Due Date (Optional)</label>
                  <input
                    type="date"
                    id="taskDueDate"
                    value={newTaskDueDate}
                    onChange={(e) => setNewTaskDueDate(e.target.value)}
                    className="w-full p-3 rounded-lg bg-slate-700/50 border border-slate-600/50 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div className="flex justify-end space-x-4 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowAddTaskModal(false)}
                    className="px-5 py-2 rounded-lg text-slate-300 border border-slate-600/50 hover:bg-slate-700/50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-gradient-to-r from-indigo-500/80 to-violet-500/80 hover:from-indigo-500 hover:to-violet-500
                               text-white px-5 py-2 rounded-lg transition-all duration-300 hover:scale-105"
                  >
                    Add Task
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirmation Modal for Deletion */}
      <AnimatePresence>
        {showConfirmModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="backdrop-blur-xl bg-slate-800/60 border border-slate-700/50 rounded-2xl p-8 shadow-2xl w-full max-w-sm text-center"
            >
              <XCircle size={48} className="text-red-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-4">Confirm Deletion</h3>
              <p className="text-slate-300 mb-6">Are you sure you want to delete this task? This action cannot be undone.</p>
              <div className="flex justify-center space-x-4">
                <button
                  type="button"
                  onClick={() => setShowConfirmModal(false)}
                  className="px-5 py-2 rounded-lg text-slate-300 border border-slate-600/50 hover:bg-slate-700/50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmDeleteTask}
                  className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-lg transition-colors"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TaskPage;
