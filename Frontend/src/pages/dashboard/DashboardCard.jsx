// src/pages/dashboard/DashboardCard.jsx
import React from 'react';
import { motion } from 'framer-motion';
// Removed: import { LucideIcon } from 'lucide-react'; // This import is causing the error

// Note: TypeScript interface commented out for .jsx compatibility.
// If you are using TypeScript (.tsx), you can uncomment this interface.
/*
interface DashboardCardProps {
  title: string;
  icon: React.ReactElement<any, any>; // Changed type to 'any' or more general ReactNode for JSX
  children: React.ReactNode;
  className?: string;
  gradient?: string; // Optional custom gradient for the card background
}
*/

const DashboardCard = ({
  title,
  icon,
  children,
  className = "",
  gradient = "from-slate-800/50 to-slate-700/30", // Default gradient if none provided
  // Add initial, whileInView, viewport, transition props from Framer Motion
  initial = "hidden",
  whileInView = "show",
  viewport = { once: true, amount: 0.3 }, // Default to animate when 30% in view, only once
  transition = { duration: 0.5, ease: "easeOut" }
}) => {
  // Define card animation variants
  const cardVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.98 }, // Increased y for a bit more "rise" effect
    show: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.7, // Slightly longer duration for a smoother reveal
        ease: "easeOut",
        // Add a slight delay for staggered appearance if used in a grid parent with staggerChildren
      }
    }
  };

  return (
    <motion.div
      variants={cardVariants}
      initial={initial}
      whileInView={whileInView}
      viewport={viewport}
      transition={transition} // Apply the transition prop here
      whileHover={{
        scale: 1.02, // Subtle lift on hover
        transition: { duration: 0.2, ease: "easeOut" }
      }}
      className={`
        bg-gradient-to-br ${gradient} backdrop-blur-xl
        border border-slate-700/50 rounded-2xl p-6
        hover:border-slate-600/50 transition-all duration-300
        shadow-lg hover:shadow-xl group
        flex flex-col /* Make it a flex column to push content and footer/button */
        ${className}
      `}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-slate-200 group-hover:text-white transition-colors">
          {title}
        </h3>
        <div className="p-2 rounded-xl bg-slate-700/30 group-hover:bg-slate-600/50 transition-colors">
          {/* Ensure the icon is properly rendered and receives hover styles */}
          {React.cloneElement(icon, {
            size: 20,
            className: "text-slate-400 group-hover:text-slate-200 transition-colors"
          })}
        </div>
      </div>

      {/* This div will hold the main content of the card and manage its height */}
      <div className="flex-grow h-full"> {/* flex-grow to make content area expand */}
        {children}
      </div>
    </motion.div>
  );
};

export default DashboardCard;
