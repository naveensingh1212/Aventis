import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Code2, Loader2, AlertCircle, ExternalLink, RefreshCw } from 'lucide-react';
import { codingAPI } from '../services/api';

export default function CodingPage() {
  const [leetcodePOTD, setLeetcodePOTD] = useState(null);
  const [codeforcesPOTD, setCodeforcesPOTD] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProblems();
  }, []);

  const fetchProblems = async () => {
    try {
      setLoading(true);
      setError('');

      const [leetcodeRes, codeforcesRes] = await Promise.all([
        codingAPI.getLeetCodePOTD(),
        codingAPI.getCodeforcesPOTD(),
      ]);

      setLeetcodePOTD(leetcodeRes?.data?.data || null);
      setCodeforcesPOTD(codeforcesRes?.data?.data || null);
    } catch (err) {
      console.error('Error fetching problems:', err);
      setError(err?.response?.data?.message || 'Failed to fetch problems');
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy':
        return 'bg-green-500/20 border-green-500/50 text-green-400';
      case 'medium':
        return 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400';
      case 'hard':
        return 'bg-red-500/20 border-red-500/50 text-red-400';
      default:
        return 'bg-gray-500/20 border-gray-500/50 text-gray-400';
    }
  };

  // Reusable card layout so both cards are structurally identical
  const ProblemCard = ({ delay, platform, subtitle, data, fields, linkLabel }) => (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay }}
      className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-8 hover:bg-white/10 transition-all duration-300 flex flex-col"
    >
      {/* Card header */}
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-white mb-1">{platform}</h2>
        <span className="text-sm text-gray-400">{subtitle}</span>
      </div>

      {data ? (
        <div className="flex flex-col flex-1 gap-4">
          {/* Problem title */}
          <h3 className="text-xl font-bold text-white min-h-[3.5rem] leading-snug">
            {fields.title}
          </h3>

          {/* Meta info row */}
          <p className="text-gray-400 text-sm">{fields.meta}</p>

          {/* Difficulty badge */}
          <div>
            <span
              className={`inline-block px-4 py-1.5 border rounded-full text-sm font-semibold ${getDifficultyColor(fields.difficulty)}`}
            >
              {fields.difficulty || 'Unknown'}
            </span>
          </div>

          {/* Extra info box (rating / date / etc.) */}
          <div className="bg-white/5 border border-white/10 rounded-lg p-4">
            <p className="text-xs text-gray-400 mb-1">{fields.extraLabel}</p>
            <p className="text-2xl font-bold text-indigo-400">{fields.extraValue || 'N/A'}</p>
          </div>

          {/* Spacer pushes button to bottom */}
          <div className="flex-1" />

          {/* CTA button */}
          <a
            href={fields.link}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold transition-colors mt-2"
          >
            {linkLabel}
            <ExternalLink size={18} />
          </a>
        </div>
      ) : (
        <p className="text-gray-400 text-center py-8 flex-1">Failed to load problem</p>
      )}
    </motion.div>
  );

  return (
    <section className="min-h-screen w-full bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 px-4 py-20 overflow-x-hidden">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Code2 className="w-10 h-10 text-indigo-400" />
            <h1 className="text-4xl md:text-5xl font-bold text-white">
              Daily Coding Challenges
            </h1>
          </div>

          <p className="text-gray-300 text-lg">
            Solve today's problems to improve your skills
          </p>

          <button
            onClick={fetchProblems}
            disabled={loading}
            className="mt-4 flex items-center gap-2 mx-auto px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-600 text-white rounded-lg font-semibold transition-colors"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </motion.div>

        {/* Error */}
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-6 flex items-center gap-3"
          >
            <AlertCircle className="text-red-400" />
            <p className="text-red-300">{error}</p>
          </motion.div>
        )}

        {/* Cards */}
        {loading ? (
          <div className="flex items-center justify-center h-96">
            <Loader2 className="w-12 h-12 text-indigo-400 animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">

            <ProblemCard
              delay={0.1}
              platform="LeetCode"
              subtitle="Problem of the Day"
              data={leetcodePOTD}
              fields={{
                title: leetcodePOTD?.title,
                meta: `Posted: ${leetcodePOTD?.date ? new Date(leetcodePOTD.date).toLocaleDateString() : 'N/A'}`,
                difficulty: leetcodePOTD?.difficulty,
                extraLabel: 'Date Posted',
                extraValue: leetcodePOTD?.date
                  ? new Date(leetcodePOTD.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
                  : 'N/A',
                link: leetcodePOTD?.link,
              }}
              linkLabel="Solve on LeetCode"
            />

            <ProblemCard
              delay={0.2}
              platform="Codeforces"
              subtitle="Random Problem"
              data={codeforcesPOTD}
              fields={{
                title: codeforcesPOTD?.name,
                meta: `Contest ID: ${codeforcesPOTD?.contestId || 'N/A'}`,
                difficulty: codeforcesPOTD?.difficulty,
                extraLabel: 'Difficulty Rating',
                extraValue: codeforcesPOTD?.rating || 'N/A',
                link: codeforcesPOTD?.link,
              }}
              linkLabel="Solve on Codeforces"
            />

          </div>
        )}
      </div>
    </section>
  );
}