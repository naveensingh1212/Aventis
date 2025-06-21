import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react'; // Using Lucide icon for Checkbox

// Reusable Task Item for the list
const TaskItem = ({ text, priority, isCompleted, onToggleComplete }) => {
  // Determine priority badge colors
  const priorityColors = {
    'High': 'bg-red-600 text-white',
    'Medium': 'bg-yellow-600 text-white',
    'Low': 'bg-green-600 text-white',
  };

  return (
    <motion.div
      className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg shadow-md border border-gray-700/30 hover:bg-gray-700/50 transition-all duration-300"
      initial={{ opacity: 0, x: -50 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex items-center space-x-3 cursor-pointer" onClick={onToggleComplete}>
        {/* Checkbox Placeholder using Lucide icon */}
        <CheckCircle className={`h-6 w-6 transition-colors duration-200 ${isCompleted ? 'text-green-500' : 'text-gray-500 hover:text-green-400'}`} />
        <span className={`text-lg font-medium ${isCompleted ? 'line-through text-gray-400' : 'text-white'}`}>
          {text}
        </span>
      </div>
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${priorityColors[priority] || 'bg-gray-500 text-white'}`}>
        {priority}
      </span>
    </motion.div>
  );
};

export default function TaskSection({ id }) {
  const [newTaskText, setNewTaskText] = useState('');
  const [tasks, setTasks] = useState([
    { id: 1, text: "Complete LeetCode daily challenge", priority: "High", isCompleted: false },
    { id: 2, text: "Review binary tree algorithms", priority: "Medium", isCompleted: false },
    { id: 3, text: "Work on portfolio project", priority: "High", isCompleted: false },
    { id: 4, text: "Practice dynamic programming", priority: "Low", isCompleted: false },
    { id: 5, text: "Prepare for upcoming contest", priority: "Medium", isCompleted: false },
  ]);

  const headingVariants = {
    hidden: { opacity: 0, y: -50 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const handleAddTask = () => {
    if (newTaskText.trim()) {
      setTasks([
        ...tasks,
        {
          id: tasks.length + 1,
          text: newTaskText.trim(),
          priority: "Medium", // Default priority for new tasks
          isCompleted: false,
        },
      ]);
      setNewTaskText('');
    }
  };

  const handleToggleComplete = (taskId) => {
    setTasks(tasks.map(task =>
      task.id === taskId ? { ...task, isCompleted: !task.isCompleted } : task
    ));
  };

  return (
    <section id={id} className="py-20 px-4 md:px-8 bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white relative z-10">
      <div className="max-w-6xl mx-auto text-center mb-16">
        <motion.h2
          variants={headingVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.5 }}
          className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent"
        >
          Stay Organized
        </motion.h2>
        <motion.p
          variants={headingVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.5 }}
          transition={{ delay: 0.2 }}
          className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto"
        >
          Manage your coding tasks and projects efficiently.
        </motion.p>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-start"> {/* Changed items-center to items-start for better alignment */}
        {/* Add Your Task Form */}
        <motion.div
          className="bg-gray-800/50 p-8 rounded-xl shadow-lg border border-gray-700/30 backdrop-blur-sm"
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
        >
          <h3 className="text-3xl font-bold text-white mb-8 text-center">Add Your Task</h3>
          <div className="space-y-6">
            <div>
              <label htmlFor="newTask" className="sr-only">Enter your new task</label>
              <input
                type="text"
                id="newTask"
                placeholder="Enter your new task..."
                value={newTaskText}
                onChange={(e) => setNewTaskText(e.target.value)}
                className="w-full p-4 rounded-lg bg-gray-900 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={handleAddTask}
              className="w-full px-6 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold text-lg shadow-md hover:shadow-xl transition-all duration-300 hover:from-blue-600 hover:to-purple-600"
            >
              Add Task
            </button>
          </div>
        </motion.div>

        {/* Tasks of the Day List */}
        <motion.div
          className="bg-gray-800/50 p-8 rounded-xl shadow-lg border border-gray-700/30 backdrop-blur-sm"
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
        >
          <h3 className="text-3xl font-bold text-white mb-8 text-center">Tasks of the Day</h3>
          <div className="space-y-4">
            {tasks.map((task) => (
              <TaskItem
                key={task.id}
                text={task.text}
                priority={task.priority}
                isCompleted={task.isCompleted}
                onToggleComplete={() => handleToggleComplete(task.id)}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
