import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import {
  Home, ListTodo, Code, Trophy, Calendar, Users, BookOpen, Gamepad,
  Clock, ArrowRight, Play, Github, MessageCircle, XCircle, Loader2, RefreshCw
} from 'lucide-react';

import DashboardHeader from './DashboardHeader';
import DashboardCard from './DashboardCard';

// Custom hook for API calls
const useApi = (token) => {
  const navigate = useNavigate();

  const apiCall = useCallback(async (url, options = {}) => {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          ...options.headers
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 401 || response.status === 403) {
          localStorage.removeItem('accessToken');
          navigate('/');
          throw new Error('Authentication expired. Please log in again.');
        }
        throw new Error(errorData.message || 'Request failed');
      }

      return response.json();
    } catch (error) {
      console.error("API Call Error:", error);
      throw error; // Re-throw to be caught by specific useEffects/handlers
    }
  }, [token, navigate]); // Added navigate to dependencies

  return { apiCall };
};

function UserHomePage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [tasks, setTasks] = useState([]);
  const [potdData, setPotdData] = useState({
    leetcode: null,
    codeforces: null,
    loading: true,
    error: null
  });
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [tasksError, setTasksError] = useState(null);
  const [token, setToken] = useState(null);

  const navigate = useNavigate();
  const { apiCall } = useApi(token);

  // Authentication check
  useEffect(() => {
    const storedToken = localStorage.getItem('accessToken');
    if (storedToken) {
      setToken(storedToken);
    } else {
      console.warn("No access token found. Redirecting to login.");
      navigate('/');
    }
  }, [navigate]);

  // Fetch POTD data
  const fetchPotdData = useCallback(async () => {
    if (!token) return;

    setPotdData(prev => ({ ...prev, loading: true, error: null }));

    try {
      const [leetcodeResponse, codeforcesResponse] = await Promise.allSettled([
        apiCall('/api/v1/coding/leetcode-potd'),
        apiCall('/api/v1/coding/codeforces-potd')
      ]);

      const potdResult = { loading: false, error: null, leetcode: null, codeforces: null };

      if (leetcodeResponse.status === 'fulfilled' && leetcodeResponse.value) {
        potdResult.leetcode = leetcodeResponse.value.data;
      } else {
        console.warn('Failed to fetch LeetCode POTD:', leetcodeResponse.reason);
        potdResult.error = potdResult.error ? potdResult.error + '; LeetCode failed' : 'LeetCode POTD failed';
      }

      if (codeforcesResponse.status === 'fulfilled' && codeforcesResponse.value) {
        potdResult.codeforces = codeforcesResponse.value.data;
      } else {
        console.warn('Failed to fetch Codeforces POTD:', codeforcesResponse.reason);
        potdResult.error = potdResult.error ? potdResult.error + '; Codeforces failed' : 'Codeforces POTD failed';
      }

      setPotdData(potdResult);
    } catch (error) {
      console.error('Error fetching POTD data:', error);
      setPotdData({
        leetcode: null,
        codeforces: null,
        loading: false,
        error: 'Failed to load problems'
      });
    }
  }, [token, apiCall]); // Added apiCall to dependencies

  useEffect(() => {
    if (token) {
      fetchPotdData();
    }
  }, [token, fetchPotdData]);

  // Fetch tasks
  const fetchTasks = useCallback(async () => {
    if (!token) return;

    setLoadingTasks(true);
    setTasksError(null);

    try {
      const result = await apiCall('/api/v1/tasks');
      setTasks(result.data?.docs || []);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      setTasksError(error.message);
    } finally {
      setLoadingTasks(false);
    }
  }, [token, apiCall]); // Added apiCall to dependencies

  useEffect(() => {
    if (token) {
      fetchTasks();
    }
  }, [token, fetchTasks]);

  // Toggle task completion
  const toggleTaskCompletion = async (taskId, currentCompleted) => {
    if (!token) {
      setTasksError("Authentication required");
      return;
    }

    // Corrected newStatus determination
    const newStatus = currentCompleted ? 'pending' : 'completed';

    // Optimistic update
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task._id === taskId
          ? { ...task, completed: !currentCompleted, status: newStatus }
          : task
      )
    );

    try {
      await apiCall(`/api/v1/tasks/${taskId}`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus })
      });
    } catch (error) {
      console.error("Error updating task:", error);
      setTasksError(error.message);

      // Revert on error
      setTasks(prevTasks =>
        prevTasks.map(task =>
          task._id === taskId
            ? { ...task, completed: currentCompleted, status: currentCompleted ? 'completed' : 'pending' }
            : task
        )
      );
    }
  };

  // Refresh POTD data
  const refreshPotd = () => {
    if (token) {
      fetchPotdData(); // Simply re-fetch the data
    }
  };

  // Animation variants
  const textRiseVariants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  const unfoldTextVariants = {
    hidden: { width: "0%", opacity: 0 },
    show: { width: "100%", opacity: 1, transition: { duration: 1.2, ease: "easeOut" } }
  };

  // Sidebar configuration
  const sidebarItems = [
    { name: "Dashboard", icon: <Home size={20} />, link: "/dashboard", active: true },
    { name: "Tasks", icon: <ListTodo size={20} />, link: "/tasks" },
    { name: "Problems", icon: <Code size={20} />, link: "/problems" },
    { name: "Contests", icon: <Trophy size={20} />, link: "/contests" },
    { name: "Calendar", icon: <Calendar size={20} />, link: "/calendar" },
    { name: "Community", icon: <Users size={20} />, link: "/community" },
    { name: "Learning", icon: <BookOpen size={20} />, link: "/learning" },
    { name: "Games", icon: <Gamepad size={20} />, link: "/games" },
  ];

  // Styled classes
  const sidebarClasses = `backdrop-blur-md bg-white/5 p-4 flex flex-col fixed h-full z-20 border-r border-white/10 transition-all duration-300 ease-in-out ${
    isSidebarOpen ? 'w-56' : 'w-16 overflow-hidden'
  }`;

  const mainClasses = `relative z-10 flex-1 p-4 transition-all duration-300 ease-in-out ${
    isSidebarOpen ? 'ml-56' : 'ml-16'
  }`;

  // Filter pending tasks
  const pendingTasks = tasks
    .filter(task => task.status === 'pending' && !task.completed)
    .sort((a, b) => {
      const priorityOrder = { 'high': 3, 'medium': 2, 'low': 1 };
      const priorityDiff = (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
      if (priorityDiff !== 0) return priorityDiff;

      if (a.dueDate && b.dueDate) {
        return new Date(a.dueDate) - new Date(b.dueDate);
      }
      if (a.dueDate) return -1;
      if (b.dueDate) return 1;
      return 0;
    })
    .slice(0, 3);

  // POTD Card Component
  const PotdCard = ({ data, platform, loading, error }) => (
    <div className="bg-slate-800/60 p-3 rounded-lg border border-slate-700/50 flex-grow flex flex-col justify-between mb-3">
      {loading ? (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="animate-spin mr-2" size={16} />
          <span className="text-slate-300 text-sm">Loading...</span>
        </div>
      ) : error ? (
        <div className="text-red-400 text-sm text-center py-2">
          Failed to load {platform} POTD
        </div>
      ) : data ? (
        <>
          <div>
            <h4 className="text-base font-semibold text-white mb-1">{platform} POTD</h4>
            <p className="text-slate-300 text-sm mb-1 truncate" title={data.title}>
              {data.title}
            </p>
          </div>
          <div className="flex items-center justify-between mt-auto"> {/* Added mt-auto here */}
            <span className={`${data.difficultyColor} text-white text-xs px-2 py-0.5 rounded-full`}>
              {data.difficulty}
            </span>
            {data.link && (
              <a
                href={data.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-400 hover:text-indigo-300 text-xs underline"
              >
                Solve
              </a>
            )}
          </div>
        </>
      ) : (
        <div className="text-slate-400 text-sm text-center py-2">
          No {platform} POTD available
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 relative overflow-hidden flex">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-slate-900/40 to-slate-900"></div>
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl"></div>

      {/* Sidebar */}
      <aside className={sidebarClasses}>
        <div className={`flex items-center mt-2 ${isSidebarOpen ? 'mb-10' : 'mb-4 justify-center'}`}>
          {isSidebarOpen ? (
            <span className="text-2xl font-bold text-indigo-400">Aventis</span>
          ) : (
            <span className="text-2xl font-bold text-indigo-400">A</span>
          )}
        </div>

        {isSidebarOpen && (
          <h3 className="text-xs font-semibold text-slate-400 uppercase mb-3 mt-4 ml-2">Main Menu</h3>
        )}

        <nav className="flex-1 space-y-1">
          {sidebarItems.map((item) => (
            <Link
              key={item.name}
              to={item.link}
              className={`flex items-center rounded-lg transition-colors duration-200 ${
                item.active
                  ? 'bg-indigo-700/50 text-white shadow-md'
                  : 'text-slate-300 hover:bg-white/10 hover:text-white'
              } ${isSidebarOpen ? 'space-x-3 p-2.5' : 'justify-center p-2'}`}
            >
              {item.icon}
              {isSidebarOpen && (
                <span className="font-medium text-sm">{item.name}</span>
              )}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className={mainClasses}>
        <DashboardHeader isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />

        {/* Welcome Section */}
        <div className="flex justify-between items-center mb-5">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.5 }}
          >
            <div className="overflow-hidden">
              <motion.h1
                variants={unfoldTextVariants}
                className="text-3xl md:text-4xl font-bold text-white mb-2 whitespace-nowrap"
              >
                Welcome back, Coder!
              </motion.h1>
            </div>
            <motion.p
              variants={textRiseVariants}
              className="text-slate-300 text-lg"
            >
              Ready to solve some challenging problems today?
            </motion.p>
          </motion.div>
        </div>

        {/* Dashboard Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Problem of the Day Card */}
          <DashboardCard
            title="Problem of the Day"
            icon={<Code />}
            className="lg:row-span-2 min-h-[460px] flex flex-col justify-between"
            action={
              <button
                onClick={refreshPotd}
                className="text-slate-400 hover:text-indigo-400 transition-colors"
                title="Refresh Problems"
              >
                <RefreshCw size={16} />
              </button>
            }
          >
            <PotdCard
              data={potdData.leetcode}
              platform="LeetCode"
              loading={potdData.loading}
              error={potdData.error && potdData.error.includes('LeetCode failed') ? 'Failed to load LeetCode POTD' : null}
            />
            <PotdCard
              data={potdData.codeforces}
              platform="Codeforces"
              loading={potdData.loading}
              error={potdData.error && potdData.error.includes('Codeforces failed') ? 'Failed to load Codeforces POTD' : null}
            />
            <div className="bg-slate-800/60 p-3 rounded-lg border border-slate-700/50 flex-grow flex flex-col justify-between">
              <div>
                <h4 className="text-base font-semibold text-white mb-1">GFG POTD</h4>
                <p className="text-slate-300 text-sm mb-1">Coming Soon...</p>
              </div>
              <span className="bg-gray-600 text-white text-xs px-2 py-0.5 rounded-full self-start">Soon</span>
            </div>
          </DashboardCard>

          {/* Contest Card */}
          <DashboardCard
            title="Contest"
            icon={<Trophy />}
            className="min-h-[190px]"
          >
            <div className="flex flex-wrap gap-2 mb-3">
              <span className="bg-blue-600 text-white text-xs px-2.5 py-1 rounded-full">Codeforces</span>
              <span className="bg-orange-600 text-white text-xs px-2.5 py-1 rounded-full">CodeChef</span>
              <span className="bg-purple-600 text-white text-xs px-2.5 py-1 rounded-full">Leetcode</span>
            </div>
            <h4 className="text-base font-semibold text-white mb-1">Weekly Contest #360</h4>
            <p className="text-slate-300 text-xs flex items-center mb-1">
              <Clock size={12} className="mr-1" /> 2h 30m
            </p>
            <p className="text-slate-300 text-xs flex items-center mb-3">
              <Users size={12} className="mr-1" /> 1.2K registered
            </p>
            <Link
              to="/contests"
              className="flex items-center justify-center space-x-2 bg-slate-800/60 text-indigo-400 py-2 rounded-lg border border-indigo-400 hover:bg-indigo-400 hover:text-black transition-colors duration-200 mt-auto text-sm"
            >
              <span>View All Contests</span> <ArrowRight size={16} />
            </Link>
          </DashboardCard>

          {/* Entertainment Card */}
          <DashboardCard
            title="Entertainment"
            icon={<Play />}
            className="min-h-[190px]"
          >
            <div className="grid grid-cols-2 gap-3 h-full">
              <div className="bg-slate-800/60 p-3 rounded-lg border border-slate-700/50 flex flex-col items-center justify-center text-center cursor-pointer hover:border-indigo-400 transition-colors text-white">
                <MessageCircle size={28} className="text-indigo-400 mb-1" />
                <p className="text-sm font-semibold">Chat</p>
              </div>
              <div className="bg-slate-800/60 p-3 rounded-lg border border-slate-700/50 flex flex-col items-center justify-center text-center cursor-pointer hover:border-indigo-400 transition-colors text-white">
                <Gamepad size={28} className="text-indigo-400 mb-1" />
                <p className="text-sm font-semibold">Games</p>
              </div>
            </div>
          </DashboardCard>

          {/* Tasks Card */}
          <DashboardCard
            title="Tasks to Complete"
            icon={<ListTodo />}
            className="lg:col-span-2 min-h-[220px]"
          >
            {loadingTasks ? (
              <div className="flex items-center justify-center h-full text-slate-300">
                <Loader2 className="animate-spin mr-2" size={20} /> Loading tasks...
              </div>
            ) : tasksError ? (
              <div className="flex items-center justify-center h-full text-red-400">
                <XCircle size={20} className="mr-2" /> Error: {tasksError}
              </div>
            ) : pendingTasks.length > 0 ? (
              <ul className="space-y-1.5 mt-2">
                {pendingTasks.map(task => (
                  <li key={task._id} className="flex items-center text-white text-sm">
                    <input
                      type="checkbox"
                      checked={task.status === 'completed'}
                      onChange={() => toggleTaskCompletion(task._id, task.status === 'completed')}
                      className="form-checkbox h-4 w-4 text-emerald-500 rounded mr-2 bg-slate-800/60 border-slate-700/50 focus:ring-emerald-500"
                    />
                    <span className={task.status === 'completed' ? 'line-through text-slate-400' : ''}>
                      {task.title}
                      {task.dueDate && ` (Due: ${new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})`}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-slate-300 text-center py-4">No pending tasks. Great job!</p>
            )}

            <Link
              to="/tasks"
              className="mt-3 px-3 py-1.5 rounded-lg bg-indigo-500/80 text-white font-semibold text-sm hover:bg-violet-500/80 transition-colors text-center block"
            >
              + View All Tasks
            </Link>
          </DashboardCard>

          {/* Coding Time Tracker Card */}
          <DashboardCard
            title="Coding Time Tracker"
            icon={<Clock />}
            className="min-h-[160px]"
          >
            <motion.p
              variants={textRiseVariants}
              className="text-slate-300 text-lg text-center mt-auto mb-auto"
            >
              Coming Soon...
            </motion.p>
          </DashboardCard>

          {/* Github Contribution Card */}
          <DashboardCard
            title="Github Contribution"
            icon={<Github />}
            className="min-h-[160px]"
          >
            <motion.p
              variants={textRiseVariants}
              className="text-slate-300 text-lg text-center mt-auto mb-auto"
            >
              Coming Soon...
            </motion.p>
          </DashboardCard>
        </div>
      </main>
    </div>
  );
}

export default UserHomePage;