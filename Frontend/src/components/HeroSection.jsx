// src/components/HeroSection.jsx
import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom'; // <--- ADDED THIS IMPORT

function HeroSection() {
  const ref = useRef(null);
  // useScroll will track the scroll position relative to the ref element
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"] // When target starts at top of viewport, and when it ends at top
  });

  // Example transforms for the 'A' rocket effect
  // Adjust these values for desired animation
  const yText = useTransform(scrollYProgress, [0, 1], ["0%", "-300%"]); // Moves up
  const scaleText = useTransform(scrollYProgress, [0, 1], [1, 0.5]);     // Shrinks
  const opacityText = useTransform(scrollYProgress, [0, 0.8], [1, 0]);  // Fades out

  return (
    <section
      ref={ref}
      className="relative min-h-screen flex flex-col items-center justify-center text-center px-4 md:px-8 py-20 overflow-hidden"
      style={{
        // Linear-like gradient background (adjust colors from tailwind.config.js)
        background: 'linear-gradient(135deg, var(--tw-colors-dark-bg) 0%, var(--tw-colors-accent-primary) 100%)',
      }}
    >
      <div className="relative z-10">
        <h1 className="text-6xl md:text-8xl lg:text-9xl font-extrabold text-dark-text-light mb-4 leading-tight">
          <motion.span
            style={{ y: yText, scale: scaleText, opacity: opacityText }}
            className="inline-block" // Allows transform on inline element
          >
            A
          </motion.span>
          ventis
        </h1>
        <p className="text-xl md:text-2xl lg:text-3xl text-dark-text-medium max-w-2xl mx-auto">
          Multi-purpose productivity platform designed for coding students
        </p>
      </div>

      {/* Call to action buttons */}
      <div className="mt-12 flex space-x-4 z-10">
        <Link
          to="/signup"
          className="px-8 py-3 rounded-lg bg-gradient-to-r from-accent-gradient-start to-accent-gradient-end text-white font-semibold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
        >
          Get Started Free
        </Link>
        {/* Placeholder for "View Today's Problems" - could link to #coding-section */}
        <a
          href="#coding-section"
          className="px-8 py-3 rounded-lg border border-dark-border text-dark-text-light font-semibold text-lg hover:bg-dark-card transition-all duration-300 transform hover:scale-105"
        >
          View Today's Problems
        </a>
      </div>

      {/* Optional: Subtle background elements for visual interest */}
      <div className="absolute inset-0 z-0 opacity-10">
        {/* You can add SVG patterns or particle effects here later */}
      </div>
    </section>
  );
}

export default HeroSection;
