// src/pages/dashboard/DashboardHeader.jsx
import React from 'react';
import { Bell, User } from 'lucide-react';

function DashboardHeader() {
  return (
    <header className="bg-dark-card p-2 rounded-xl shadow-lg border border-dark-border mb-8 flex justify-end items-center min-h-[48px]">
      <div className="flex items-center space-x-4 shrink-0">
        <Bell size={22} className="text-dark-text-medium cursor-pointer hover:text-accent-primary transition-colors" />
        <User size={22} className="text-dark-text-medium cursor-pointer hover:text-accent-primary transition-colors" />
      </div>
    </header>
  );
}

export default DashboardHeader;
