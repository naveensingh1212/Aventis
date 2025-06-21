// src/components/GamesSection.jsx
import React from 'react';
import { motion } from 'framer-motion';

const GameCard = ({ title, description, icon }) => (
  <motion.div
    className="bg-dark-card p-6 rounded-xl shadow-lg border border-dark-border text-center flex flex-col items-center justify-between"
    initial={{ opacity: 0, y: 50 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.3 }}
    transition={{ duration: 0.5 }}
  >
    <div className="text-5xl mb-4 text-accent-primary">
      {icon} {/* Using emojis as placeholder icons */}
    </div>
    <h3 className="text-xl font-semibold text-dark-text-light mb-2">{title}</h3>
    <p className="text-dark-text-medium text-sm mb-4">{description}</p>
    <button className="px-6 py-2 rounded-lg bg-gradient-to-r from-accent-gradient-start to-accent-gradient-end text-white font-semibold shadow-md hover:shadow-xl transition-all duration-300">
      Play Now
    </button>
  </motion.div>
);

function GamesSection({ id }) {
  const headingVariants = {
    hidden: { opacity: 0, y: -50 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  return (
    <section 
      id={id} 
      // Changed background to match CodingSection
      className="py-20 px-4 md:px-8 bg-gradient-to-br from-gray-900 via-black to-gray-800 text-dark-text-light"
    >
      <div className="max-w-6xl mx-auto text-center mb-16">
        <motion.h2
          variants={headingVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.5 }}
          className="text-4xl md:text-5xl font-bold mb-4 text-accent-primary"
        >
          Take a Break
        </motion.h2>
        <motion.p
          variants={headingVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.5 }}
          transition={{ delay: 0.2 }}
          className="text-lg md:text-xl text-dark-text-medium max-w-3xl mx-auto"
        >
          Sharpen your mind with entertaining mini-games.
        </motion.p>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
        <GameCard
          title="Tic-Tac-Toe"
          description="Classic strategy game"
          icon="⭕❌"
        />
        <GameCard
          title="Flappy Bird"
          description="Test your reflexes"
          icon="🐦"
        />
        <GameCard
          title="Code Puzzle"
          description="Logic-based challenges"
          icon="🧩"
        />
      </div>
    </section>
  );
}

export default GamesSection;
