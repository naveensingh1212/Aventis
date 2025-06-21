import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom'; // Import useNavigate
import { Mail, Lock } from 'lucide-react'; // Import necessary Lucide icons

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate(); // Initialize useNavigate

  const headingVariants = {
    hidden: { opacity: 0, y: -50 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const formVariants = {
    hidden: { opacity: 0, x: -50 }, // Adjusted x for entry from left
    show: { opacity: 1, x: 0, transition: { duration: 0.6, delay: 0.2 } }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    // Guest Login Logic
    if (email === 'guest' && password === '123') {
      console.log('Guest Login Successful!');
      navigate('/guest-dashboard'); // Redirect to guest homepage
    } else {
      // Normal Login Logic (placeholder for your actual authentication)
      console.log('Login Attempt:', { email, password });
      // You would typically handle actual form validation and API calls here
      // For now, let's simulate a successful normal login and redirect to the main dashboard
      // In a real app, this would involve checking credentials against a backend
      if (email === 'user@example.com' && password === 'password') { // Example for normal user
          console.log("Normal User Login successful!");
          navigate('/dashboard'); // Redirect to main user dashboard
      } else {
          // Instead of alert, you'd show an error message in the UI
          console.error("Login failed: Invalid credentials.");
          // You could set a state variable to display an error message to the user
      }
    }
  };

  return (
    <section id="login" className="relative py-20 px-4 md:px-8 bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white min-h-screen flex flex-col items-center justify-center">
      <div className="max-w-md mx-auto text-center mb-10 z-20">
        <motion.h2
          variants={headingVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.5 }}
          className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"
        >
          Welcome Back to Aventis
        </motion.h2>
        <motion.p
          variants={headingVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.5 }}
          transition={{ delay: 0.2 }}
          className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto"
        >
          Log in to continue your coding journey.
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
        transition={{ type: "spring", stiffness: 400, damping: 10 }}
      >
        <h3 className="text-3xl font-bold text-dark-text-light mb-8 text-center">Login</h3>
        <form onSubmit={handleLogin} className="space-y-6">
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-text-medium" size={20} />
            <label htmlFor="email" className="sr-only">Email</label>
            <input
              type="email"
              id="email"
              placeholder="Email (e.g., guest or user@example.com)"
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
              placeholder="Password (e.g., 123 for guest or password)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 pl-10 rounded-lg bg-dark-bg border border-dark-border text-dark-text-light focus:outline-none focus:ring-2 focus:ring-accent-primary"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full px-6 py-3 rounded-lg bg-gradient-to-r from-accent-gradient-start to-accent-gradient-end text-white font-semibold text-lg shadow-md hover:shadow-xl transition-all duration-300 hover:from-accent-gradient-end hover:to-accent-gradient-start"
          >
            Login
          </button>
        </form>
        <p className="mt-6 text-center text-dark-text-medium">
          Don't have an account?{' '}
          <Link to="/signup" className="text-accent-primary hover:underline font-semibold">
            Sign Up
          </Link>
        </p>
      </motion.div>
    </section>
  );
}
    