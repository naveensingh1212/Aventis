// src/pages/dashboard/DashboardHeader.jsx
import React from 'react';
import { Search, Bell, User, ChevronLeft, ChevronRight } from 'lucide-react';

function DashboardHeader({ isSidebarOpen, setIsSidebarOpen }) {
  return (
    <header className="bg-dark-card p-2 rounded-xl shadow-lg border border-dark-border mb-8 flex justify-between items-center">
      {/* Left Group: Toggle Button + Search Bar */}
      <div className="flex items-center flex-grow">
        {/* Sidebar Toggle Button */}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-1.5 rounded-full bg-dark-bg text-white hover:bg-dark-border transition-colors duration-200 shrink-0" // Reduced padding
        >
          {isSidebarOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
        </button>

        {/* Search bar - now immediately next to the button */}
        <div className="relative flex-1 mx-2 max-w-md"> {/* Adjusted mx and added max-w-md for better control */}
          <Search size={18} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-dark-text-medium" /> {/* Smaller icon and adjusted left */}
          <input
            type="text"
            placeholder="Search problems, contests..."
            className="w-full pl-9 pr-2 py-1.5 rounded-lg bg-dark-bg border border-dark-border text-dark-text-light text-sm focus:outline-none focus:ring-1 focus:ring-primary" // Reduced padding, smaller text
          />
        </div>
      </div>

      {/* Right Group: User/Notification Icons */}
      <div className="flex items-center space-x-3 shrink-0"> {/* Adjusted space-x */}
        <Bell size={20} className="text-dark-text-medium cursor-pointer hover:text-accent-primary transition-colors" /> {/* Smaller icon size */}
        <User size={20} className="text-dark-text-medium cursor-pointer hover:text-accent-primary transition-colors" /> {/* Smaller icon size */}
      </div>
    </header>
  );
}

export default DashboardHeader;
