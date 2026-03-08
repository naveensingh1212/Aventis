import React, { useState, useEffect, useRef } from 'react';
import { ExternalLink, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { contestAPI } from '../services/api';

const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

function getCache(key) {
  try {
    const data = localStorage.getItem(key);
    const time = localStorage.getItem(`${key}_time`);
    if (data && time && Date.now() - parseInt(time) < CACHE_TTL) {
      return JSON.parse(data);
    }
  } catch (_) {}
  return null;
}

function setCache(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    localStorage.setItem(`${key}_time`, Date.now().toString());
  } catch (_) {}
}

export default function ContestPage() {
  // Load from cache immediately — no spinner if cache exists
  const [codeforcesContests, setCodeforcesContests] = useState(() => getCache('cf_contests') || []);
  const [codechefContests, setCodechefContests]     = useState(() => getCache('cc_contests') || []);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const hasFetched = useRef(false);

  useEffect(() => {
    // If both caches are warm, skip the network call entirely
    const cfCached = getCache('cf_contests');
    const ccCached = getCache('cc_contests');
    if (cfCached && ccCached) {
      setCodeforcesContests(cfCached);
      setCodechefContests(ccCached);
      return;
    }
    // Otherwise fetch only what's missing
    if (!hasFetched.current) {
      hasFetched.current = true;
      fetchAllContests(false);
    }
  }, []);

  const fetchAllContests = async (forceRefresh = false) => {
    setLoading(true);
    setError('');
    try {
      // Codeforces
      const cfCached = !forceRefresh && getCache('cf_contests');
      if (cfCached) {
        setCodeforcesContests(cfCached);
      } else {
        const cfRes = await contestAPI.getCodeforcesContests();
        const cfData = cfRes.data.data || [];
        setCodeforcesContests(cfData);
        setCache('cf_contests', cfData);
      }

      // CodeChef
      const ccCached = !forceRefresh && getCache('cc_contests');
      if (ccCached) {
        setCodechefContests(ccCached);
      } else {
        const ccRes = await contestAPI.getCodeChefContests();
        const ccData = ccRes.data.data || [];
        setCodechefContests(ccData);
        setCache('cc_contests', ccData);
      }
    } catch (err) {
      console.error('Error fetching contests:', err);
      setError('Failed to fetch contests');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });

  const getCountdown = (startTime) => {
    const diff = new Date(startTime).getTime() - Date.now();
    if (diff < 0) return { text: 'Started', color: 'text-red-500' };
    const days    = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours   = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    if (days > 0)  return { text: `${days}d ${hours}h`,   color: 'text-green-400' };
    if (hours > 0) return { text: `${hours}h ${minutes}m`, color: 'text-yellow-400' };
    return { text: `${minutes}m`, color: 'text-red-400' };
  };

  const ContestCard = ({ contest, type }) => {
    const isCF = type === 'codeforces';
    const event      = isCF ? contest.name : (contest.title || contest.name);
    const startTime  = contest.startTime;
    const endTime    = contest.endTime || (contest.duration
      ? new Date(new Date(startTime).getTime() + contest.duration * 60000).toISOString()
      : null);
    const duration   = contest.duration;
    const url        = contest.url;
    const borderColor = isCF ? 'border-l-blue-500' : 'border-l-yellow-500';
    const label       = isCF ? '💙 Codeforces' : '🍛 CodeChef';
    const labelColor  = isCF ? 'text-blue-400' : 'text-yellow-400';
    const countdown   = getCountdown(startTime);

    return (
      <div className={`bg-white/5 border border-white/10 rounded-lg p-5 border-l-4 ${borderColor} hover:border-white/20 transition-all`}>
        <h3 className="text-lg font-semibold text-white mb-1 line-clamp-2">{event}</h3>
        <p className={`text-xs font-medium mb-4 ${labelColor}`}>{label}</p>
        <div className="space-y-2 mb-4 text-sm">
          <div>
            <span className="text-gray-400 font-medium">Start: </span>
            <span className="text-gray-300">{formatDate(startTime)}</span>
          </div>
          {endTime && (
            <div>
              <span className="text-gray-400 font-medium">End: </span>
              <span className="text-gray-300">{formatDate(endTime)}</span>
            </div>
          )}
          {duration && (
            <div>
              <span className="text-gray-400 font-medium">Duration: </span>
              <span className="text-gray-300">{Math.round(duration)} minutes</span>
            </div>
          )}
        </div>
        <div className={`text-center text-sm font-bold mb-4 p-2 rounded bg-white/5 ${countdown.color}`}>
          {countdown.text}
        </div>
        {url ? (
          <a href={url} target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded text-white text-sm font-medium transition-colors">
            Register <ExternalLink size={14} />
          </a>
        ) : (
          <button disabled className="w-full px-4 py-2 bg-gray-700 text-gray-400 rounded text-sm font-medium cursor-not-allowed">No Link</button>
        )}
      </div>
    );
  };

  const isEmpty = codeforcesContests.length === 0 && codechefContests.length === 0;

  return (
    <section className="min-h-screen bg-slate-900 px-4 py-16 overflow-x-hidden">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-white mb-2">Upcoming Contests</h1>
          <p className="text-gray-400 mb-6">Compete on LeetCode, Codeforces and CodeChef</p>
          <button
            onClick={() => fetchAllContests(true)}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded font-medium transition-colors disabled:opacity-50"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>

        {/* Error */}
        {error && isEmpty && (
          <div className="bg-red-500/20 border border-red-500/50 rounded p-4 mb-8 flex items-center gap-3">
            <AlertCircle className="text-red-400" size={20} />
            <p className="text-red-300">{error}</p>
          </div>
        )}

        {/* Full-page spinner only when cache is empty */}
        {loading && isEmpty ? (
          <div className="flex flex-col items-center justify-center h-64">
            <Loader2 className="w-10 h-10 text-blue-400 animate-spin mb-3" />
            <p className="text-gray-400">Loading contests...</p>
          </div>
        ) : (
          <>
            {codeforcesContests.length > 0 && (
              <div className="mb-12">
                <h2 className="text-2xl font-bold text-white mb-6">
                  💙 Codeforces ({codeforcesContests.length})
                  {loading && <Loader2 size={18} className="inline ml-2 animate-spin text-blue-400" />}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {codeforcesContests.map((c, i) => <ContestCard key={i} contest={c} type="codeforces" />)}
                </div>
              </div>
            )}

            {codechefContests.length > 0 && (
              <div className="mb-12">
                <h2 className="text-2xl font-bold text-white mb-6">
                  🍛 CodeChef ({codechefContests.length})
                  {loading && <Loader2 size={18} className="inline ml-2 animate-spin text-yellow-400" />}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {codechefContests.map((c, i) => <ContestCard key={i} contest={c} type="codechef" />)}
                </div>
              </div>
            )}

            {!loading && isEmpty && (
              <div className="text-center text-gray-400 py-16">
                <p className="text-lg">No contests available</p>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}