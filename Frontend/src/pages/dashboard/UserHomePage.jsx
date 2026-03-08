import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import {
  ListTodo, Code, Trophy, Clock, ArrowRight, Play, Github,
  MessageCircle, XCircle, Loader2, RefreshCw, Gamepad
} from 'lucide-react';

import DashboardHeader from './DashboardHeader';
import DashboardCard from './DashboardCard';

// ── Cache helpers ─────────────────────────────────────────────────────────────
const POTD_TTL      = 60 * 60 * 1000;  // 1 hour  (POTD changes daily)
const CONTESTS_TTL  = 10 * 60 * 1000;  // 10 mins
const TASKS_TTL     = 2  * 60 * 1000;  // 2 mins

function getCache(key, ttl) {
  try {
    const data = localStorage.getItem(key);
    const time = localStorage.getItem(`${key}_time`);
    if (data && time && Date.now() - parseInt(time) < ttl) return JSON.parse(data);
  } catch (_) {}
  return null;
}

function setCache(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    localStorage.setItem(`${key}_time`, Date.now().toString());
  } catch (_) {}
}
// ─────────────────────────────────────────────────────────────────────────────

const useApi = (token) => {
  const navigate = useNavigate();
  const apiCall = useCallback(async (url, options = {}) => {
    const response = await fetch(url, {
      ...options,
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json', ...options.headers }
    });
    if (!response.ok) {
      const errorData = await response.json();
      if (response.status === 401 || response.status === 403) { localStorage.removeItem('accessToken'); navigate('/'); }
      throw new Error(errorData.message || 'Request failed');
    }
    return response.json();
  }, [token, navigate]);
  return { apiCall };
};

function UserHomePage() {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [token, setToken] = useState(null);

  // ── POTD: read from cache instantly on first render ──────────────────────
  const [potdData, setPotdData] = useState(() => {
    const lc = getCache('potd_leetcode', POTD_TTL);
    const cf = getCache('potd_codeforces', POTD_TTL);
    return { leetcode: lc, codeforces: cf, loading: !lc || !cf, error: null };
  });

  // ── Tasks: read from cache instantly ────────────────────────────────────
  const [tasks, setTasks]             = useState(() => getCache('dashboard_tasks', TASKS_TTL) || []);
  const [loadingTasks, setLoadingTasks] = useState(!getCache('dashboard_tasks', TASKS_TTL));
  const [tasksError, setTasksError]   = useState(null);

  // ── Contests: read from cache instantly ─────────────────────────────────
  const [contests, setContests]               = useState(() => getCache('cf_contests', CONTESTS_TTL)?.slice(0,6) || []);
  const [loadingContests, setLoadingContests] = useState(!getCache('cf_contests', CONTESTS_TTL));
  const [contestsError, setContestsError]     = useState(null);

  const potdFetched     = useRef(false);
  const tasksFetched    = useRef(false);
  const contestsFetched = useRef(false);

  const { apiCall } = useApi(token);

  // Auth check
  useEffect(() => {
    const stored = localStorage.getItem('accessToken');
    if (stored) setToken(stored);
    else navigate('/');
  }, [navigate]);

  // ── Fetch POTD (skips if both cached) ──────────────────────────────────
  const fetchPotdData = useCallback(async (force = false) => {
    if (!token) return;
    const lcCached = !force && getCache('potd_leetcode', POTD_TTL);
    const cfCached = !force && getCache('potd_codeforces', POTD_TTL);
    if (lcCached && cfCached) {
      setPotdData({ leetcode: lcCached, codeforces: cfCached, loading: false, error: null });
      return;
    }
    setPotdData(prev => ({ ...prev, loading: true, error: null }));
    try {
      const [lcRes, cfRes] = await Promise.allSettled([
        lcCached ? Promise.resolve({ data: lcCached }) : apiCall('/api/v1/coding/leetcode-potd'),
        cfCached ? Promise.resolve({ data: cfCached }) : apiCall('/api/v1/coding/codeforces-potd'),
      ]);
      const lc = lcCached || (lcRes.status === 'fulfilled' ? lcRes.value.data : null);
      const cf = cfCached || (cfRes.status === 'fulfilled' ? cfRes.value.data : null);
      if (lc && !lcCached) setCache('potd_leetcode', lc);
      if (cf && !cfCached) setCache('potd_codeforces', cf);
      setPotdData({ leetcode: lc, codeforces: cf, loading: false, error: (!lc && !cf) ? 'Failed to load problems' : null });
    } catch {
      setPotdData(prev => ({ ...prev, loading: false, error: 'Failed to load problems' }));
    }
  }, [token, apiCall]);

  // ── Fetch Tasks (skips if cached) ───────────────────────────────────────
  const fetchTasks = useCallback(async () => {
    if (!token) return;
    const cached = getCache('dashboard_tasks', TASKS_TTL);
    if (cached) { setTasks(cached); setLoadingTasks(false); return; }
    setLoadingTasks(true); setTasksError(null);
    try {
      const result = await apiCall('/api/v1/tasks');
      const data = result.data?.docs || [];
      setTasks(data);
      setCache('dashboard_tasks', data);
    } catch (err) { setTasksError(err.message); }
    finally { setLoadingTasks(false); }
  }, [token, apiCall]);

  // ── Fetch Contests (skips if cached) ────────────────────────────────────
  const fetchContests = useCallback(async () => {
    if (!token) return;
    const cached = getCache('cf_contests', CONTESTS_TTL);
    if (cached) { setContests(cached.slice(0, 6)); setLoadingContests(false); return; }
    setLoadingContests(true); setContestsError(null);
    try {
      const [cfRes, ccRes] = await Promise.allSettled([
        apiCall('/api/v1/contests/codeforces'),
        apiCall('/api/v1/contests/codechef'),
      ]);
      const combined = [
        ...(cfRes.status === 'fulfilled' ? cfRes.value?.data || [] : []),
        ...(ccRes.status === 'fulfilled' ? ccRes.value?.data || [] : []),
      ]
        .map(c => ({ ...c, startTime: c.startTime || c.start_time || c.start }))
        .filter(c => c.startTime)
        .sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
      setCache('cf_contests', combined);
      setContests(combined.slice(0, 6));
    } catch { setContestsError('Failed to load contests'); }
    finally { setLoadingContests(false); }
  }, [token, apiCall]);

  // Fire fetches once token is ready, skip if cache was already loaded
  useEffect(() => {
    if (!token) return;
    if (!potdFetched.current)     { potdFetched.current = true;     fetchPotdData(); }
    if (!tasksFetched.current)    { tasksFetched.current = true;     fetchTasks(); }
    if (!contestsFetched.current) { contestsFetched.current = true;  fetchContests(); }
  }, [token, fetchPotdData, fetchTasks, fetchContests]);

  // Task completion toggle (invalidates tasks cache)
  const toggleTaskCompletion = async (taskId, currentCompleted) => {
    if (!token) return;
    const newStatus = currentCompleted ? 'pending' : 'completed';
    setTasks(prev => prev.map(t => t._id === taskId ? { ...t, completed: !currentCompleted, status: newStatus } : t));
    localStorage.removeItem('dashboard_tasks');
    try {
      await apiCall(`/api/v1/tasks/${taskId}`, { method: 'PUT', body: JSON.stringify({ status: newStatus }) });
    } catch (err) {
      setTasksError(err.message);
      setTasks(prev => prev.map(t => t._id === taskId ? { ...t, completed: currentCompleted, status: currentCompleted ? 'completed' : 'pending' } : t));
    }
  };

  const textRiseVariants   = { hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } } };
  const unfoldTextVariants = { hidden: { width: '0%', opacity: 0 }, show: { width: '100%', opacity: 1, transition: { duration: 1.2, ease: 'easeOut' } } };

  const pendingTasks = tasks
    .filter(t => t.status === 'pending' && !t.completed)
    .sort((a, b) => {
      const order = { high: 3, medium: 2, low: 1 };
      const diff = (order[b.priority] || 0) - (order[a.priority] || 0);
      if (diff !== 0) return diff;
      if (a.dueDate && b.dueDate) return new Date(a.dueDate) - new Date(b.dueDate);
      return a.dueDate ? -1 : b.dueDate ? 1 : 0;
    })
    .slice(0, 3);

  // ── POTD Card ─────────────────────────────────────────────────────────────
  const PotdCard = ({ data, platform }) => (
    <div className="bg-slate-800/60 p-3 rounded-lg border border-slate-700/50 flex-grow flex flex-col justify-between mb-3">
      {potdData.loading && !data ? (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="animate-spin mr-2 text-indigo-400" size={16} />
          <span className="text-slate-300 text-sm">Loading...</span>
        </div>
      ) : data ? (
        <>
          <div>
            <h4 className="text-base font-semibold text-white mb-1">{platform} POTD</h4>
            <p className="text-slate-300 text-sm mb-1 truncate" title={data.title}>{data.title}</p>
          </div>
          <div className="flex items-center justify-between mt-auto">
            <span className={`${data.difficultyColor} text-white text-xs px-2 py-0.5 rounded-full`}>{data.difficulty}</span>
            {data.link && <a href={data.link} target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:text-indigo-300 text-xs underline">Solve</a>}
          </div>
        </>
      ) : (
        <div className="text-slate-400 text-sm text-center py-2">No {platform} POTD available</div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 relative overflow-hidden flex">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-slate-900/40 to-slate-900"></div>
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl"></div>

      <main className="relative z-10 flex-1 p-4">
        <DashboardHeader isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />

        <div className="flex justify-between items-center mb-5">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.5 }}>
            <div className="overflow-hidden">
              <motion.h1 variants={unfoldTextVariants} className="text-3xl md:text-4xl font-bold text-white mb-2 whitespace-nowrap">
                Welcome back, Coder!
              </motion.h1>
            </div>
            <motion.p variants={textRiseVariants} className="text-slate-300 text-lg">
              Ready to solve some challenging problems today?
            </motion.p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

          {/* POTD Card */}
          <DashboardCard
            title="Problem of the Day" icon={<Code />}
            className="lg:row-span-2 min-h-[460px] flex flex-col justify-between"
            action={
              <button onClick={() => fetchPotdData(true)} className="text-slate-400 hover:text-indigo-400 transition-colors" title="Refresh Problems">
                <RefreshCw size={16} className={potdData.loading ? 'animate-spin' : ''} />
              </button>
            }
          >
            <PotdCard data={potdData.leetcode}    platform="LeetCode" />
            <PotdCard data={potdData.codeforces}  platform="Codeforces" />
            <div className="bg-slate-800/60 p-3 rounded-lg border border-slate-700/50 flex-grow flex flex-col justify-between">
              <div>
                <h4 className="text-base font-semibold text-white mb-1">GFG POTD</h4>
                <p className="text-slate-300 text-sm mb-1">Coming Soon...</p>
              </div>
              <span className="bg-gray-600 text-white text-xs px-2 py-0.5 rounded-full self-start">Soon</span>
            </div>
          </DashboardCard>

          {/* Contest Card */}
          <DashboardCard title="Contest" icon={<Trophy />} className="min-h-[190px] flex flex-col">
            <div className="flex flex-wrap gap-2 mb-3">
              <span className="bg-blue-600 text-white text-xs px-2.5 py-1 rounded-full">Codeforces</span>
              <span className="bg-orange-600 text-white text-xs px-2.5 py-1 rounded-full">CodeChef</span>
              <span className="bg-purple-600 text-white text-xs px-2.5 py-1 rounded-full">Leetcode</span>
            </div>
            {loadingContests ? (
              <div className="text-slate-300 text-sm flex items-center gap-2"><Loader2 size={14} className="animate-spin" /> Loading...</div>
            ) : contestsError ? (
              <div className="text-red-400 text-sm">{contestsError}</div>
            ) : contests.length > 0 ? (() => {
              const c = contests[0];
              return (
                <div className="space-y-2">
                  <h4 className="text-base font-semibold text-white mb-1 line-clamp-1">{c.title || c.name}</h4>
                  <p className="text-slate-300 text-xs flex items-center mb-1"><Clock size={12} className="mr-1" /> {new Date(c.startTime).toLocaleString()}</p>
                  <p className="text-slate-300 text-xs mb-3">{c.platform}{c.duration ? ` • ${Math.round(c.duration)}m` : ''}</p>
                  {c.url && <a href={c.url} target="_blank" rel="noopener noreferrer" className="block w-full text-center px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-500 transition-colors">Register</a>}
                </div>
              );
            })() : <div className="text-slate-400 text-sm">No upcoming contests</div>}
            <Link to="/contests" className="flex items-center justify-center space-x-2 bg-slate-800/60 text-indigo-400 py-2 rounded-lg border border-indigo-400 hover:bg-indigo-400 hover:text-black transition-colors duration-200 mt-auto text-sm">
              <span>View All Contests</span><ArrowRight size={16} />
            </Link>
          </DashboardCard>

          {/* Entertainment Card */}
          <DashboardCard title="Entertainment" icon={<Play />} className="min-h-[190px]">
            <div className="grid grid-cols-2 gap-3 h-full">
              <div className="bg-slate-800/60 p-3 rounded-lg border border-slate-700/50 flex flex-col items-center justify-center text-center cursor-pointer hover:border-indigo-400 transition-colors text-white">
                <MessageCircle size={28} className="text-indigo-400 mb-1" /><p className="text-sm font-semibold">Chat</p>
              </div>
              <div className="bg-slate-800/60 p-3 rounded-lg border border-slate-700/50 flex flex-col items-center justify-center text-center cursor-pointer hover:border-indigo-400 transition-colors text-white">
                <Gamepad size={28} className="text-indigo-400 mb-1" /><p className="text-sm font-semibold">Games</p>
              </div>
            </div>
          </DashboardCard>

          {/* Tasks Card */}
          <DashboardCard title="Tasks to Complete" icon={<ListTodo />} className="lg:col-span-2 min-h-[220px]">
            {loadingTasks ? (
              <div className="flex items-center justify-center h-full text-slate-300"><Loader2 className="animate-spin mr-2" size={20} /> Loading tasks...</div>
            ) : tasksError ? (
              <div className="flex items-center justify-center h-full text-red-400"><XCircle size={20} className="mr-2" /> Error: {tasksError}</div>
            ) : pendingTasks.length > 0 ? (
              <ul className="space-y-1.5 mt-2">
                {pendingTasks.map(task => (
                  <li key={task._id} className="flex items-center text-white text-sm">
                    <input type="checkbox" checked={task.status === 'completed'} onChange={() => toggleTaskCompletion(task._id, task.status === 'completed')}
                      className="form-checkbox h-4 w-4 text-emerald-500 rounded mr-2 bg-slate-800/60 border-slate-700/50 focus:ring-emerald-500" />
                    <span className={task.status === 'completed' ? 'line-through text-slate-400' : ''}>
                      {task.title}{task.dueDate && ` (Due: ${new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})`}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-slate-300 text-center py-4">No pending tasks. Great job!</p>
            )}
            <Link to="/tasks" className="mt-3 px-3 py-1.5 rounded-lg bg-indigo-500/80 text-white font-semibold text-sm hover:bg-violet-500/80 transition-colors text-center block">
              + View All Tasks
            </Link>
          </DashboardCard>

          {/* Coding Time Tracker */}
          <DashboardCard title="Coding Time Tracker" icon={<Clock />} className="min-h-[160px]">
            <p className="text-slate-300 text-lg text-center mt-auto mb-auto">Coming Soon...</p>
          </DashboardCard>

          {/* Github Contribution */}
          <DashboardCard title="Github Contribution" icon={<Github />} className="min-h-[160px]">
            <p className="text-slate-300 text-lg text-center mt-auto mb-auto">Coming Soon...</p>
          </DashboardCard>

        </div>
      </main>
    </div>
  );
}

export default UserHomePage;