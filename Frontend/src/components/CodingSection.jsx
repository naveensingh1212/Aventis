// src/components/CodingSection.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock } from 'lucide-react'; // Import Lucide icons

// Reusable card for problems/contests (Drastically smaller and more compact)
const Card = ({ title, subTitle, difficulty, date, time }) => (
  <motion.div
    className="bg-dark-bg p-2 rounded-lg shadow-md border border-dark-border flex flex-col justify-between min-h-[70px] max-h-[80px] cursor-pointer hover:shadow-xl transition-shadow duration-300" /* Using dark-bg for individual card background */
    initial={{ opacity: 0, y: 20 }} // Smaller initial animation offset
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.7 }} // Trigger very early for compact section
    transition={{ duration: 0.3 }} // Faster animation
  >
    <div>
      <h4 className="text-xs font-semibold text-dark-text-light line-clamp-1">{title}</h4> {/* Smallest font, one line clamp */}
      <p className="text-dark-text-medium text-xxs mt-0.5 line-clamp-2">{subTitle}</p> {/* Extra small font, two line clamps */}
    </div>
    <div className="mt-1 text-xxs flex justify-between items-center text-dark-text-medium"> {/* Extra small font */}
      {difficulty && (
        <span className={`px-1 py-0.5 rounded-full text-xxs font-medium ${ /* Smallest padding */
          difficulty === 'Easy' ? 'bg-green-600 text-white' :
          difficulty === 'Medium' ? 'bg-yellow-600 text-white' :
          difficulty === 'Hard' ? 'bg-red-600 text-white' :
          'bg-gray-600 text-white'
        }`}>
          {difficulty}
        </span>
      )}
      {(date || time) && (
        <span className="flex items-center space-x-0.5"> {/* Reduced space */}
          {date && (
             <span className="flex items-center space-x-0.5 text-accent-primary"> {/* Added accent color for icon */}
               <Calendar size={12} /> {/* Replaced emoji with Lucide Calendar icon */}
               <span>{date}</span>
             </span>
          )}
          {time && (
             <span className="flex items-center space-x-0.5 text-accent-primary"> {/* Added accent color for icon */}
               <Clock size={12} /> {/* Replaced emoji with Lucide Clock icon */}
               <span>{time}</span>
             </span>
          )}
        </span>
      )}
    </div>
  </motion.div>
);

export default function CodingSection({ id }) {
  const headingVariants = {
    hidden: { opacity: 0, y: -50 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const textBlockVariants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, delay: 0.2 } }
  };

  return (
    <section id={id} className="py-20 px-4 md:px-8 bg-gradient-to-br from-gray-900 via-black to-gray-800 text-dark-text-light min-h-screen flex flex-col justify-center">
      <div className="max-w-6xl mx-auto text-center mb-10">
        <motion.h2
          variants={headingVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.5 }}
          // Changed gradient for 'Master Your Coding Journey' to be more aesthetic
          className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-accent-primary via-accent-secondary to-accent-primary bg-clip-text text-transparent"
        >
          Master Your Coding Journey
        </motion.h2>
        <motion.p
          variants={headingVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.5 }}
          transition={{ delay: 0.2 }}
          className="text-lg md:text-xl text-dark-text-medium max-w-3xl mx-auto"
        >
          Daily problems and contest tracking to keep you sharp.
        </motion.p>
      </div>

      {/* Main content area: Explanatory text + Problem/Contest sections */}
      {/* Uses a grid to place explanatory text on sides for larger screens */}
      <div className="max-w-full mx-auto grid grid-cols-1 lg:grid-cols-[0.8fr_2fr_0.8fr] gap-8 items-start">
        {/* Left Explanatory Text for Problem of the Day */}
        <motion.div
          variants={textBlockVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          // Ensure proper alignment for text blocks
          className="lg:col-start-1 lg:col-end-2 flex flex-col justify-center lg:items-end text-center lg:text-right p-4 lg:p-0"
        >
          <h4 className="text-xl font-bold text-white mb-2">Sharpen Your Skills Daily</h4>
          <p className="text-dark-text-medium text-sm md:text-base leading-relaxed max-w-sm">
            Tackle new challenges every day. Our curated problems push your boundaries,
            reinforce concepts, and keep your problem-solving abilities at their peak.
            Consistent practice is key to mastering algorithms.
          </p>
        </motion.div>

        {/* Problem of the Day & Upcoming Contests sections (now in the middle column) */}
        <div className="lg:col-start-2 lg:col-end-3 grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
          {/* Problem of the Day Section */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6 }}
            className="relative bg-dark-card p-6 rounded-xl shadow-lg border border-dark-border backdrop-blur-sm
                       transform transition-all duration-300 ease-in-out
                       hover:scale-[1.01] hover:shadow-glow hover:border-accent-primary"
          >
            <h3
              className="text-2xl font-bold text-white mb-5 text-center" /* Heading text-white */
            >
              Problem of the Day
            </h3>
            <div className="space-y-3">
              <Card title="LeetCode: Longest Palindromic Subsequence" subTitle="Dynamic Programming" difficulty="Hard" />
              <Card title="Codeforces: Choosing Teams" subTitle="Implementation, Greedy" difficulty="Easy" />
              <Card title="GeeksforGeeks: Pair with Given Sum" subTitle="Array, Hashing Technique" difficulty="Medium" />
            </div>
          </motion.div>

          {/* Upcoming Contests Section */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6 }}
            className="relative bg-dark-card p-6 rounded-xl shadow-lg border border-dark-border backdrop-blur-sm
                       transform transition-all duration-300 ease-in-out
                       hover:scale-[1.01] hover:shadow-glow hover:border-accent-primary"
          >
            <h3
              className="text-2xl font-bold text-white mb-5 text-center" /* Heading text-white */
            >
              Upcoming Contests
            </h3>
            <div className="space-y-3">
              <Card title="Codeforces Round #123 (Div. 2)" date="June 25, 2025" time="17:30 UTC" />
              <Card title="LeetCode Weekly Contest 444" date="June 26, 25, 2025" time="02:30 UTC" />
              <Card title="CodeChef June Cook-Off 2025" date="June 28, 2025" time="21:30 UTC" />
            </div>
          </motion.div>
        </div>

        {/* Right Explanatory Text for Upcoming Contests */}
        <motion.div
          variants={textBlockVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          // Ensure proper alignment for text blocks
          className="lg:col-start-3 lg:col-end-4 flex flex-col justify-center lg:items-start text-center lg:text-left p-4 lg:p-0"
        >
          <h4 className="text-xl font-bold text-white mb-2">Dominate the Leaderboards</h4>
          <p className="text-dark-text-medium text-sm md:text-base leading-relaxed max-w-sm">
            Never miss an opportunity to test your limits. Our contest tracker keeps you informed,
            helping you strategize your participation and climb the ranks on global platforms.
            Compete and prove your prowess.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
