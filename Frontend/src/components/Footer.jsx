// src/components/Footer.jsx
import React from 'react';

function Footer({ id }) {
  return (
    <footer 
      id={id} 
      // Changed background to match CodingSection and GamesSection
      className="bg-gradient-to-br from-gray-900 via-black to-gray-800 py-10 px-4 md:px-8 text-dark-text-medium text-center"
    >
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
        {/* Copyright */}
        <p>&copy; {new Date().getFullYear()} Aventis. All rights reserved.</p>

        {/* Footer Navigation Links */}
        <div className="flex flex-wrap justify-center space-x-6 md:space-x-8 text-sm">
          <a href="#" className="hover:text-accent-primary transition-colors duration-200">About Us</a>
          <a href="#" className="hover:text-accent-primary transition-colors duration-200">Privacy Policy</a>
          <a href="#" className="hover:text-accent-primary transition-colors duration-200">Terms of Service</a>
          <a href="#" className="hover:text-accent-primary transition-colors duration-200">Contact</a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
