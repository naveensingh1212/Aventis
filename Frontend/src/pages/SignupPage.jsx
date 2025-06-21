import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Mail, Lock, User } from 'lucide-react'; // Import necessary Lucide icons

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const headingVariants = {
    hidden: { opacity: 0, y: -50 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const formVariants = {
    hidden: { opacity: 0, x: 50 },
    show: { opacity: 1, x: 0, transition: { duration: 0.6, delay: 0.2 } }
  };

  const handleSignup = (e) => {
    e.preventDefault();
    // Add signup logic here (e.g., API call)
    console.log('Signup Attempt:', { email, password, confirmPassword });
    // You would typically handle form validation and API calls here
    if (password !== confirmPassword) {
      // Using a custom message box or toast notification instead of alert()
      // For simplicity, I'm logging to console, but in a real app, you'd show a visible message to the user.
      console.error("Passwords do not match!");
      return;
    }
    // Simulate successful signup
    console.log("Signup successful! You can now log in."); // Using console.log for simplicity
    // Redirect to login page or dashboard (replace with actual navigation)
  };

  return (
    <section id="signup" className="relative py-20 px-4 md:px-8 bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white min-h-screen flex flex-col items-center justify-center">
      <div className="max-w-md mx-auto text-center mb-10 z-20">
        <motion.h2
          variants={headingVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.5 }}
          className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"
        >
          Create Your Aventis Account
        </motion.h2>
        <motion.p
          variants={headingVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.5 }}
          transition={{ delay: 0.2 }}
          className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto"
        >
          Join the ultimate platform for coding students.
        </motion.p>
      </div>

      <motion.div
        variants={formVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.3 }}
        className="relative bg-dark-card p-8 rounded-xl shadow-lg border border-dark-border backdrop-blur-sm w-full max-w-md
                   transform transition-all duration-300 ease-in-out
                   hover:scale-[1.01] hover:border-accent-primary"
        whileHover={{ boxShadow: '0 15px 30px rgba(0,0,0,0.4)' }}
        // The spring transition has been removed to simplify the animation
      >
        <h3 className="text-3xl font-bold text-dark-text-light mb-8 text-center">Sign Up</h3>
        <form onSubmit={handleSignup} className="space-y-6">
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-text-medium" size={20} />
            <label htmlFor="email" className="sr-only">Email</label>
            <input
              type="email"
              id="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 pl-10 rounded-lg bg-dark-bg border border-dark-border text-dark-text-light focus:outline-none focus:ring-2 focus:ring-accent-primary"
              required
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-text-medium" size={20} />
            <label htmlFor="password" className="sr-only">Password</label>
            <input
              type="password"
              id="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 pl-10 rounded-lg bg-dark-bg border border-dark-border text-dark-text-light focus:outline-none focus:ring-2 focus:ring-accent-primary"
              required
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-text-medium" size={20} />
            <label htmlFor="confirmPassword" className="sr-only">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full p-3 pl-10 rounded-lg bg-dark-bg border border-dark-border text-dark-text-light focus:outline-none focus:ring-2 focus:ring-accent-primary"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full px-6 py-3 rounded-lg bg-gradient-to-r from-accent-gradient-start to-accent-gradient-end text-white font-semibold text-lg shadow-md hover:shadow-xl transition-all duration-300 hover:from-accent-gradient-end hover:to-accent-gradient-start"
          >
            Sign Up
          </button>
        </form>
        <p className="mt-6 text-center text-dark-text-medium">
          Already have an account?{' '}
          <Link to="/login" className="text-accent-primary hover:underline font-semibold">
            Login
          </Link>
        </p>
      </motion.div>
    </section>
  );
}
