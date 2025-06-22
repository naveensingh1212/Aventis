// src/App.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { useLocation } from 'react-router-dom';


// Import your page components
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';   // Placeholder
import SignupPage from './pages/SignupPage'; // Placeholder
import UserHomePage from './pages/UserHomePage'; // Import the new User Home Page component
import StarsBackground from './components/StarsBackground'; // Import the StarsBackground component

function App() {
  const location = useLocation();

  return (
    <>
      {/* StarsBackground will cover the entire screen behind content */}
      {/* CRITICAL: Place it here, outside of Routes, to act as a global background */}
      <StarsBackground />

      <Routes  key={location.pathname}>
        {/* Route for your Landing Page */}
        <Route path="/" element={<LandingPage />} />

        {/* Placeholder Routes for Login and Signup */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        {/* New Route for User Home Page */}
        <Route path="/dashboard" element={<UserHomePage />} /> {/* You can change '/dashboard' to any path you prefer, e.g., '/userhome' */}

        {/* You can add a 404 Not Found route here later if needed */}
        {/* <Route path="*" element={<div>404 Not Found</div>} /> */}
      </Routes>
    </>
  );
}

export default App;
