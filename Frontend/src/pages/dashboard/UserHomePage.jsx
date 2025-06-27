// src/pages/dashboard/UserHomePage.jsx
import React, { useState } from 'react';
import {
  Home, ListTodo, Code, Trophy, Calendar, Users, BookOpen, Gamepad, // Existing sidebar icons
  Clock, ArrowRight, Play, Github, LineChart, // New icons for cards
  CheckCircle, XCircle, Plus, // Icons for To-Do/add
  // You might need more specific icons as we build out cards, e.g., for filters or specific problems.
} from 'lucide-react';

import DashboardHeader from './DashboardHeader';
import { motion } from 'framer-motion'; 
function UserHomePage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const textRiseVariants = {
    hidden: { opacity: 0, y: 30 }, 
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } } 
  };

  const unfoldTextVariants = {
  hidden: { width: "0%", opacity: 0 }, // Starts with no width, invisible
  show: { width: "100%", opacity: 1, transition: { duration: 1.2, ease: "easeOut" } } // Expands to full width, fades in slowly
};

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

  // Extracted sidebar base classes for readability
  const sidebarBaseClasses = `bg-dark-card p-4 flex flex-col fixed h-full z-20 border-r border-dark-border transition-all duration-300 ease-in-out`;
  // Changed 'w-14' to 'w-16' for collapsed state
  const sidebarWidthClasses = isSidebarOpen ? 'w-56' : 'w-16 overflow-hidden'; // Added overflow-hidden here

  // Extracted main content base classes for readability
  const mainBaseClasses = `flex-1 p-8 transition-all duration-300 ease-in-out`;
  // Matching refined sidebar widths
  const mainMarginClasses = isSidebarOpen ? 'ml-56' : 'ml-16'; // Changed 'ml-14' to 'ml-16'

  return (
    <div className="min-h-screen bg-dark-bg text-dark-text-light flex">
      {/* Sidebar */}
      <aside className={`${sidebarBaseClasses} ${sidebarWidthClasses}`}>
        {/* Logo/App Name */}
        <div className={`flex items-center mt-2 ${isSidebarOpen ? 'mb-10' : 'mb-4 justify-center'}`}>
          {isSidebarOpen ? (
            <span className="text-2xl font-bold text-accent-primary">Aventis</span>
          ) : (
            <span className="text-2xl font-bold text-accent-primary">A</span>
          )}
        </div>

        {/* Main Menu Heading */}
        {isSidebarOpen && (
          <h3 className="text-xs font-semibold text-dark-text-medium uppercase mb-3 mt-4 ml-2">Main Menu</h3>
        )}

        <nav className="flex-1 space-y-1">
          {sidebarItems.map((item) => {
            // Extracted nav item classes for readability
            const navItemClasses = `flex items-center rounded-lg transition-colors duration-200`;
            const activeClasses = item.active ? 'bg-accent-primary text-white shadow-md' : 'text-dark-text-medium hover:bg-dark-border hover:text-dark-text-light';
            const itemLayoutClasses = isSidebarOpen ? 'space-x-3 p-2.5' : 'justify-center p-2';

            return (
              <a
                key={item.name}
                href={item.link}
                className={`${navItemClasses} ${activeClasses} ${itemLayoutClasses}`}
              >
                {item.icon}
                {isSidebarOpen && (
                  <span className="font-medium text-sm">{item.name}</span>
                )}
              </a>
            );
          })}
        </nav>
      </aside>

      {/* Main content area */}
      <main className={`${mainBaseClasses} ${mainMarginClasses}`}>
        <DashboardHeader isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />

        {/* Welcome Section & Problems Solved */}
        <div className="flex justify-between items-center mb-8">
          <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{once:true,amount:0.5}}
          >
          <motion.h1
          variants={textRiseVariants}
          className="text-3xl md:text-4xl font-bold text-white mb-2">Welcome back, Coder!</motion.h1>
          <motion.p
          variants={textRiseVariants} // Apply variants
          className="text-dark-text-medium text-lg"
        >
          Ready to solve some challenging problems today?
        </motion.p>
      </motion.div>
          
        </div>

        {/* Dashboard Cards Grid (Empty for now) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Individual DashboardCard components will go here */}
        </div>

      </main>
    </div>
  );
}

export default UserHomePage;
