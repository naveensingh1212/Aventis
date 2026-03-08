import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';

import LandingPage   from './pages/LandingPage';
import LoginPage     from './pages/LoginPage';
import SignupPage    from './pages/SignupPage';
import UserHomePage  from './pages/dashboard/UserHomePage';
import StarsBackground from './components/StarsBackground';
import TaskPage      from './pages/TaskPage';
import ChatPage      from './pages/ChatPage';
import Sidebar       from './components/Sidebar';
import ContestPage   from './pages/ContestPage';
import CodingPage    from './pages/CodingPage';
import GamingPage    from './pages/GamingPage';

// ✅ ChatSidebar is NOT imported — ChatPage has its own list panel built in

const AUTH_ROUTES = ['/', '/login', '/signup'];

function App() {
  const location = useLocation();
  const isAuthPage = AUTH_ROUTES.includes(location.pathname);
  const isChatPage = location.pathname === '/chat';

  return (
    <>
      <StarsBackground />

      {isAuthPage ? (
        <Routes key={location.pathname}>
          <Route path="/"       element={<LandingPage />} />
          <Route path="/login"  element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
        </Routes>
      ) : (
        <div className="flex h-screen overflow-hidden">
          {/* ✅ No sidebar at all on /chat — ChatPage has its own panel */}
          {!isChatPage && <Sidebar />}

          <main className="flex-1 min-w-0 overflow-y-auto">
            <Routes key={location.pathname}>
              <Route path="/dashboard" element={<UserHomePage />} />
              <Route path="/tasks"     element={<TaskPage />} />
              <Route path="/chat"      element={<ChatPage />} />
              <Route path="/contests"  element={<ContestPage />} />
              <Route path="/coding"    element={<CodingPage />} />
              <Route path="/gaming"    element={<GamingPage />} />
            </Routes>
          </main>
        </div>
      )}
    </>
  );
}

export default App;