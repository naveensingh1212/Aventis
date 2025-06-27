// src/pages/dashboard/UserHomePage.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion'; // Ensure motion is imported for cards
import {
  Home, ListTodo, Code, Trophy, Calendar, Users, BookOpen, Gamepad, // Existing sidebar icons
  Clock, ArrowRight, ExternalLink // Icons needed for cards
} from 'lucide-react';

// Import DashboardHeader (already done)
import DashboardHeader from './DashboardHeader';
// Import DashboardCard (make sure this is here)
import DashboardCard from './DashboardCard';

const DashboardCard = ({ title, icon, className, children }) => {
  return (
    <motion.div
      className={`bg-dark-card p-6 rounded-xl shadow-lg border border-dark-border flex flex-col justify-between min-h-[160px] ${className || ''}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-dark-text-light">{title}</h3>
        {icon && <span className="text-accent-primary">{icon}</span>}
      </div>
      {children} {/* This is where the specific content for each card will go */}
    </motion.div>
  );
};


{/* Dashboard Cards Grid */}
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {/* Problem of the Day Card */}
  <DashboardCard title="Problem of the Day" icon={<Code size={20} />}>
    {/* LeetCode Problem */}
    <div className="mb-3">
      <h4 className="text-md font-semibold text-white">LeetCode: Two Sum Array</h4>
      <span className="bg-green-600 text-white text-xs px-2 py-0.5 rounded-full mt-1 inline-block">Easy</span>
    </div>

    {/* GeeksforGeeks Problem */}
    <div className="mb-3">
      <h4 className="text-md font-semibold text-white">GFG: Longest Common Subsequence</h4>
      <span className="bg-yellow-600 text-white text-xs px-2 py-0.5 rounded-full mt-1 inline-block">Medium</span>
    </div>

    {/* CodeChef/Codeforces Problem */}
    <div className="mb-4">
      <h4 className="text-md font-semibold text-white">Codeforces: Beautiful Matrix</h4>
      <span className="bg-red-600 text-white text-xs px-2 py-0.5 rounded-full mt-1 inline-block">Hard</span>
    </div>

    {/* View All Problems Button */}
    <a
      href="/problems" // Link to your dedicated problems page
      className="flex items-center justify-center space-x-2 bg-dark-bg text-accent-primary py-2.5 rounded-lg border border-accent-primary hover:bg-accent-primary hover:text-white transition-colors duration-200"
    >
      <span>View All Problems</span> <ArrowRight size={18} />
    </a>
  </DashboardCard>

  {/* Other cards will go here later */}

</div>
export default DashboardCard;