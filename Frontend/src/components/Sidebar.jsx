import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, ListTodo, Code, Trophy, Calendar, Users, BookOpen, Gamepad, MessageCircle } from 'lucide-react';

export default function Sidebar() {
  const location = useLocation();

  const sidebarItems = [
    { name: 'Dashboard', icon: <Home size={20} />, link: '/dashboard' },
    { name: 'Tasks', icon: <ListTodo size={20} />, link: '/tasks' },
    { name: 'Problems', icon: <Code size={20} />, link: '/coding' },
    { name: 'Contests', icon: <Trophy size={20} />, link: '/contests' },
    { name: 'Chat', icon: <MessageCircle size={20} />, link: '/chat' },

    { name: 'Learning Curve', icon: <BookOpen size={20} />, link: '/learning' },
    { name: 'Games', icon: <Gamepad size={20} />, link: '/gaming' },
  ];

  return (
    <aside className="sticky top-0 h-screen w-56 shrink-0 z-30 backdrop-blur-md bg-slate-900/80 border-r border-white/10 p-4">
      <div className="mt-2 mb-6">
        <span className="text-2xl font-bold text-indigo-400">Aventis</span>
      </div>

      <h3 className="text-xs font-semibold text-slate-400 uppercase mb-3">Main Menu</h3>

      <nav className="space-y-1">
        {sidebarItems.map(item => (
          <Link
            key={item.name}
            to={item.link}
            className={`flex items-center rounded-lg transition-colors duration-200 text-slate-300 hover:bg-white/10 hover:text-white p-2.5 gap-3 ${location.pathname === item.link ? 'bg-indigo-700/50 text-white shadow-md' : ''}`}
          >
            {item.icon}
            <span className="font-medium text-sm">{item.name}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
}