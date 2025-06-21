// src/components/StarsBackground.jsx
import React from 'react';

// Custom CSS for star animation
const starStyles = `
  .stars-container {
    position: fixed; /* Keep stars fixed relative to the viewport */
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
    z-index: -1; /* CRITICAL: Puts stars behind all other content */
    pointer-events: none; /* Allows clicks to pass through to content below */
    background: #000000; /* Ensure a black background for stars to pop */
  }

  .star {
    position: absolute;
    background-color: #ffffff; /* White stars */
    border-radius: 50%;
    /* Combine twinkle and moveStars animations */
    animation: twinkle 5s infinite ease-in-out alternate, moveStars linear infinite;
  }

  /* Different sizes and opacities for stars for natural look */
  .star:nth-child(3n+1) {
    width: 2px;
    height: 2px;
    opacity: 0.7;
  }
  .star:nth-child(3n+2) {
    width: 3px;
    height: 3px;
    opacity: 0.9;
  }
  .star:nth-child(3n) {
    width: 1.5px;
    height: 1.5px;
    opacity: 0.5;
  }

  /* Animation for stars moving up */
  @keyframes moveStars {
    from { transform: translateY(100vh); } /* Start from bottom of viewport */
    to { transform: translateY(-100vh); } /* Move up to beyond top of viewport */
  }

  /* Subtle twinkling effect */
  @keyframes twinkle {
    0%, 100% { opacity: 0.6; }
    50% { opacity: 1; }
  }
`;

function StarsBackground() {
  // Generate a fixed number of stars with random positions and animation delays/durations
  const numStars = 100; // Number of stars
  const stars = Array.from({ length: numStars }).map((_, i) => (
    <div
      key={i}
      className="star"
      style={{
        left: `${Math.random() * 100}%`, // Random horizontal position
        top: `${Math.random() * 200 - 100}%`, // Start anywhere from -100%vh to +100%vh initially
        animationDelay: `${Math.random() * 50}s`, // Randomize animation start
        animationDuration: `${50 + Math.random() * 50}s`, // Randomize animation speed
        opacity: `${0.3 + Math.random() * 0.7}`, // Randomize initial opacity
      }}
    />
  ));

  return (
    <>
      {/* Embed the custom CSS for animations */}
      <style>{starStyles}</style>
      <div className="stars-container">
        {stars}
      </div>
    </>
  );
}

export default StarsBackground;
