// src/pages/LandingPage.jsx
import React from 'react';

// Import your section components
import Navbar from '../components/Navbar';
import HeroSection from '../components/HeroSection';
import FeaturesSection from '../components/FeaturesSection';
import CodingSection from '../components/CodingSection';
import TaskSection from '../components/TaskSection';
import GamesSection from '../components/GamesSection';
import Footer from '../components/Footer';

function LandingPage() {
  return (
    <div className="min-h-screen font-inter"> {/* Apply global font */}
      {/* Navbar will likely be fixed or sticky at the top */}
      <Navbar />

      {/* Main sections, each with an ID for scroll-to-section navigation */}
      <HeroSection /> {/* This div will have the "A" rocket animation */}
      <FeaturesSection id="features-section" />
      <CodingSection id="coding-section" />
      <TaskSection id="task-section" />
      <GamesSection id="games-section" />
      <Footer id="footer-section" />
    </div>
  );
}

export default LandingPage;
