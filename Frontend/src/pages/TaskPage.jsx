// src/pages/TaskPage.jsx
import React, { useState, useEffect } from 'react';
import { Plus, Check, Clock, Calendar, XCircle, Loader2, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
// ✅ IMPORT YOUR CUSTOM API
import { taskAPI } from '../services/api'; 

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

const TaskItemCard = ({ task, toggleCompletion, getPriorityColor, handleDeleteClick }) => (
  <motion.div
    layout
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.3, ease: 'easeOut' }}
    className={`
      backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-5
      hover:bg-white/10 transition-all duration-300 hover:scale-[1.02]
      hover:shadow-xl hover:shadow-slate-900/20 border-l-4 ${getPriorityColor(task.priority)}
      ${task.status === 'completed' ? 'opacity-60' : ''}
    `}
  >
    <div className="flex items-start space-x-4">
      <button
        onClick={() => toggleCompletion(task._id, task.status)}
        className={`mt-1 w-6 h-6 rounded-lg border-2 flex items-center justify-center
                    transition-all duration-300 hover:scale-110 ${
                      task.status === 'completed'
                        ? 'bg-emerald-500/80 border-emerald-400 text-white'
                        : 'border-slate-400/60 hover:border-indigo-400/80 hover:bg-indigo-500/20'
                    }`}
      >
        {task.status === 'completed' && <Check className="w-4 h-4" />}
      </button>

      <div className="flex-1 min-w-0">
        <h3 className={`text-lg font-medium mb-2 transition-all duration-300 ${
          task.status === 'completed' ? 'text-slate-400 line-through' : 'text-white'
        }`}>
          {task.title}
        </h3>
        <p className={`text-sm mb-3 transition-all duration-300 ${
          task.status === 'completed' ? 'text-slate-500' : 'text-slate-300'
        }`}>
          {task.description}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-400 bg-slate-800/50 px-2 py-1 rounded-lg">
            {task.dueDate
              ? new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
              : 'No Due Date'}
          </span>
          <span className={`text-xs px-2 py-1 rounded-lg font-medium ${
            task.priority === 'high'   ? 'bg-red-500/20 text-red-300' :
            task.priority === 'medium' ? 'bg-amber-500/20 text-amber-300' :
                                         'bg-emerald-500/20 text-emerald-300'
          }`}>
            {task.priority ? task.priority.toUpperCase() : 'N/A'}
          </span>
        </div>
      </div>

      <IconButton
        icon={Trash2}
        onClick={() => handleDeleteClick(task._id)}
        className="text-red-400 hover:bg-red-500/20 ml-4"
        label="Delete Task"
      />
    </div>
  </motion.div>
);

const TaskPage = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState('low');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [taskToDeleteId, setTaskToDeleteId] = useState(null);

  const navigate = useNavigate();

  // ✅ 1. FETCH TASKS (Using taskAPI)
  useEffect(() => {
    const fetchTasks = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await taskAPI.getAllTasks();
        // Backend returns { success: true, data: { docs: [...] } }
        setTasks(response.data.data?.docs || response.data.data || []);
      } catch (err) {
        if (err.response?.status === 401) navigate('/');
        setError(err.response?.data?.message || 'Failed to fetch tasks');
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, [navigate]);

  // ✅ 2. TOGGLE COMPLETION (Using taskAPI)
  const toggleTaskCompletion = async (taskId, currentStatus) => {
    const newStatus = currentStatus === 'completed' ? 'pending' : 'completed';
    
    // Optimistic Update
    setTasks(prev => prev.map(t =>
      t._id === taskId ? { ...t, status: newStatus } : t
    ));

    try {
      await taskAPI.updateTask(taskId, { status: newStatus });
    } catch (err) {
      setError('Failed to update task status');
      // Rollback on error
      setTasks(prev => prev.map(t =>
        t._id === taskId ? { ...t, status: currentStatus } : t
      ));
    }
  };

  // ✅ 3. CREATE TASK (Using taskAPI)
  const handleNewTaskSubmit = async (e) => {
    e.preventDefault();
    if (newTaskTitle.trim().length < 3) {
      setError('Task title must be at least 3 characters long.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await taskAPI.createTask({
        title: newTaskTitle,
        description: newTaskDescription,
        priority: newTaskPriority,
        dueDate: newTaskDueDate || undefined,
        status: 'pending'
      });
      
      setTasks(prev => [...prev, response.data.data]);
      setShowAddTaskModal(false);
      setNewTaskTitle('');
      setNewTaskDescription('');
      setNewTaskPriority('low');
      setNewTaskDueDate('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add task');
    } finally {
      setLoading(false);
    }
  };

  // ✅ 4. DELETE TASK (Using taskAPI)
  const handleDeleteClick = (taskId) => {
    setTaskToDeleteId(taskId);
    setShowConfirmModal(true);
  };

  const confirmDeleteTask = async () => {
    if (!taskToDeleteId) return;
    setLoading(true);
    setShowConfirmModal(false);
    try {
      await taskAPI.deleteTask(taskToDeleteId);
      setTasks(prev => prev.filter(t => t._id !== taskToDeleteId));
      setTaskToDeleteId(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete task');
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':   return 'border-l-red-400/60';
      case 'medium': return 'border-l-amber-400/60';
      case 'low':    return 'border-l-emerald-400/60';
      default:       return 'border-l-slate-400/60';
    }
  };

  const currentTasks = tasks
    .filter(t => t.status === 'pending' && (!t.dueDate || new Date(t.dueDate).setHours(0,0,0,0) <= new Date().setHours(0,0,0,0)))
    .sort((a, b) => new Date(a.dueDate || 0) - new Date(b.dueDate || 0));

  const upcomingTasks = tasks
    .filter(t => t.status === 'pending' && t.dueDate && new Date(t.dueDate).setHours(0,0,0,0) > new Date().setHours(0,0,0,0))
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-slate-900/40 to-slate-900"></div>
      
      <div className="relative z-10 container mx-auto px-6 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-12">
          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-8 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-light text-white mb-2 tracking-wide">Task Management</h1>
                <p className="text-slate-300 text-lg font-light">Focus on what matters most</p>
              </div>
              <button
                onClick={() => setShowAddTaskModal(true)}
                className="bg-gradient-to-r from-indigo-500/80 to-violet-500/80 hover:from-indigo-500 hover:to-violet-500
                           text-white px-6 py-3 rounded-2xl transition-all duration-300
                           hover:scale-105 hover:shadow-xl hover:shadow-indigo-500/25 group flex items-center"
              >
                <Plus className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform duration-300" />
                Add New Task
              </button>
            </div>
          </div>
        </div>

        {/* Status Messaging */}
        {loading && <div className="flex items-center justify-center text-white p-8"><Loader2 className="animate-spin mr-3" /> Syncing...</div>}
        {error && <div className="bg-red-600/20 text-red-300 p-4 rounded-lg flex items-center justify-center mb-6"><XCircle className="mr-2" /> {error}</div>}

        {/* Task Columns */}
        {!loading && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6">
                <div className="flex items-center mb-6">
                  <Clock className="w-6 h-6 text-indigo-400 mr-3" />
                  <h2 className="text-2xl font-light text-white">Current</h2>
                </div>
                <div className="space-y-4">
                  {currentTasks.map(task => <TaskItemCard key={task._id} task={task} toggleCompletion={toggleTaskCompletion} getPriorityColor={getPriorityColor} handleDeleteClick={handleDeleteClick} />)}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6">
                <div className="flex items-center mb-6">
                  <Calendar className="w-6 h-6 text-violet-400 mr-3" />
                  <h2 className="text-2xl font-light text-white">Upcoming</h2>
                </div>
                <div className="space-y-4">
                  {upcomingTasks.map(task => <TaskItemCard key={task._id} task={task} toggleCompletion={toggleTaskCompletion} getPriorityColor={getPriorityColor} handleDeleteClick={handleDeleteClick} />)}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add Modal */}
      <AnimatePresence>
        {showAddTaskModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-slate-800 border border-slate-700 rounded-2xl p-8 w-full max-w-md">
              <h2 className="text-2xl text-white mb-6">New Task</h2>
              <form onSubmit={handleNewTaskSubmit} className="space-y-4">
                <input type="text" placeholder="Title" value={newTaskTitle} onChange={e => setNewTaskTitle(e.target.value)} className="w-full p-3 bg-slate-700 rounded-lg text-white" required />
                <textarea placeholder="Description" value={newTaskDescription} onChange={e => setNewTaskDescription(e.target.value)} className="w-full p-3 bg-slate-700 rounded-lg text-white" />
                <select value={newTaskPriority} onChange={e => setNewTaskPriority(e.target.value)} className="w-full p-3 bg-slate-700 rounded-lg text-white">
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
                <input type="date" value={newTaskDueDate} onChange={e => setNewTaskDueDate(e.target.value)} className="w-full p-3 bg-slate-700 rounded-lg text-white" />
                <div className="flex justify-end gap-4 mt-6">
                  <button type="button" onClick={() => setShowAddTaskModal(false)} className="text-slate-400">Cancel</button>
                  <button type="submit" className="bg-indigo-600 px-6 py-2 rounded-lg text-white">Create</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Modal */}
      <AnimatePresence>
        {showConfirmModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
            <div className="bg-slate-800 p-8 rounded-2xl max-w-sm text-center">
              <XCircle size={48} className="text-red-500 mx-auto mb-4" />
              <h3 className="text-xl text-white mb-4">Delete Task?</h3>
              <div className="flex gap-4">
                <button onClick={() => setShowConfirmModal(false)} className="flex-1 bg-slate-700 py-2 rounded-lg text-white">No</button>
                <button onClick={confirmDeleteTask} className="flex-1 bg-red-600 py-2 rounded-lg text-white">Yes, Delete</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TaskPage;