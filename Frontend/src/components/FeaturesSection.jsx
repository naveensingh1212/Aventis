// src/components/FeaturesSection.jsx
import React from 'react';
import { motion } from 'framer-motion';

// Removed the FeatureCard component definition as it will no longer be used.

function FeaturesSection({ id }) {
  const headingVariants = {
    hidden: { opacity: 0, y: -50 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const cardContainerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15 // Stagger animation for cards
      }
    }
  };

  const cardItemVariants = {
    hidden: { opacity: 0, y: 50 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
  };

  return (
    <section
      id={id}
      // Removed the specific background gradient here to allow the global StarsBackground to show through
      className="relative py-20 px-4 md:px-8 text-dark-text-light overflow-hidden min-h-screen flex flex-col items-center justify-center"
    >
      <div className="max-w-6xl mx-auto text-center mb-16 z-20">
        <motion.h2
          initial={{ opacity: 0, y: -50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6 }}
          className="text-4xl md:text-5xl font-bold mb-4 text-white" // Main heading remains white
        >
          Aventis: Connecting Everything
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: -30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg md:text-xl text-dark-text-medium max-w-3xl mx-auto" // Subheading changed to text-dark-text-medium
        >
          Aventis seamlessly integrates all aspects of your coding journey into one powerful platform.
          No more juggling multiple apps – everything you need is here.
        </motion.p>
      </div>

      <motion.div
        variants={cardContainerVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.3 }}
        className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 z-10" // Responsive grid for features
      >
        {/* Replaced FeatureCard with div */}
        <motion.div
          variants={cardItemVariants}
          className="bg-dark-card p-6 rounded-xl shadow-lg border border-dark-border text-center flex flex-col items-center justify-start h-full"
          whileHover={{ scale: 1.03, boxShadow: '0 15px 30px rgba(0,0,0,0.4)' }} // Subtle lift and shadow on hover
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
        >
          <div className="p-4 bg-dark-bg rounded-full text-accent-primary mb-6">
            <span className="text-5xl">📝</span>
          </div>
          <h3 className="text-xl font-bold mb-3 text-white">Comprehensive To-Do List</h3> {/* Card title remains white */}
          <p className="text-dark-text-medium text-base leading-relaxed">Organize your coding tasks, assignments, and personal goals. Set priorities and never miss a deadline again.</p> {/* Card description changed to text-dark-text-medium */}
        </motion.div>

        {/* Replaced FeatureCard with div */}
        <motion.div
          variants={cardItemVariants}
          className="bg-dark-card p-6 rounded-xl shadow-lg border border-dark-border text-center flex flex-col items-center justify-start h-full"
          whileHover={{ scale: 1.03, boxShadow: '0 15px 30px rgba(0,0,0,0.4)' }} // Subtle lift and shadow on hover
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
        >
          <div className="p-4 bg-dark-bg rounded-full text-accent-primary mb-6">
            <span className="text-5xl">🏆</span>
          </div>
          <h3 className="text-xl font-bold mb-3 text-white">Aggregated Problem of the Day</h3> {/* Card title remains white */}
          <p className="text-dark-text-medium text-base leading-relaxed">Access curated daily coding challenges from LeetCode, Codeforces, GeeksforGeeks, and more – all in one place.</p> {/* Card description changed to text-dark-text-medium */}
        </motion.div>

        {/* Replaced FeatureCard with div */}
        <motion.div
          variants={cardItemVariants}
          className="bg-dark-card p-6 rounded-xl shadow-lg border border-dark-border text-center flex flex-col items-center justify-start h-full"
          whileHover={{ scale: 1.03, boxShadow: '0 15px 30px rgba(0,0,0,0.4)' }} // Subtle lift and shadow on hover
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
        >
          <div className="p-4 bg-dark-bg rounded-full text-accent-primary mb-6">
            <span className="text-5xl">🗓️</span>
          </div>
          <h3 className="text-xl font-bold mb-3 text-white">Real-time Contest Tracker</h3> {/* Card title remains white */}
          <p className="text-dark-text-medium text-base leading-relaxed">Stay updated with upcoming coding contests across various platforms, ensuring you're always ready to compete.</p> {/* Card description changed to text-dark-text-medium */}
        </motion.div>

        {/* Replaced FeatureCard with div */}
        <motion.div
          variants={cardItemVariants}
          className="bg-dark-card p-6 rounded-xl shadow-lg border border-dark-border text-center flex flex-col items-center justify-start h-full"
          whileHover={{ scale: 1.03, boxShadow: '0 15px 30px rgba(0,0,0,0.4)' }} // Subtle lift and shadow on hover
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
        >
          <div className="p-4 bg-dark-bg rounded-full text-accent-primary mb-6">
            <span className="text-5xl">🎮</span>
          </div>
          <h3 className="text-xl font-bold mb-3 text-white">Engaging Mini-Games</h3> {/* Card title remains white */}
          <p className="text-dark-text-medium text-base leading-relaxed">Take refreshing breaks with fun, quick coding-related games designed to sharpen your logic and skills.</p> {/* Card description changed to text-dark-text-medium */}
        </motion.div>
      </motion.div>
    </section>
  );
}

export default FeaturesSection;
