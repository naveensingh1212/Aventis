import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Loader2 } from 'lucide-react'; // Added Loader2 for loading state without Spinner
import axios from 'axios';

export default function Login() {
  const [identifier, setIdentifier] = useState(''); // can be username or email
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await axios.post(
        '/api/v1/auth/login', // <--- CORRECTED THIS URL to match your backend routing
        {
          username: identifier,
          email: identifier,
          password
        },
        { withCredentials: true }
      );

      const { accessToken, refreshToken } = res.data.data; // Destructure directly from res.data.data

      if (accessToken) {
        localStorage.setItem('accessToken', accessToken); // Save accessToken to localStorage
        console.log('Login successful! Access token stored in localStorage.');
        navigate('/dashboard'); // Navigate to dashboard after successful login
      } else {
        throw new Error('Access token not received in response data.');
      }

    } catch (err) {
      console.error('Login error:', err.response?.data?.message || err.message);
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section
      className="min-h-screen w-full flex items-center justify-center bg-[url('/space-bg.jpg')] bg-cover bg-center bg-no-repeat px-4 py-20"
    >
      <motion.div
        className="backdrop-blur-lg bg-black/40 border border-gray-700 shadow-[0_0_20px_2px_rgba(255,255,255,0.1)] rounded-3xl p-10 w-full max-w-lg text-white"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h2 className="text-4xl font-bold text-center mb-2 bg-gradient-to-r from-cyan-400 via-purple-500 to-indigo-500 text-transparent bg-clip-text">
          Welcome Back to Aventis
        </h2>
        <p className="text-center text-gray-300 mb-8">
          Log in to continue your interstellar journey.
        </p>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Username or Email"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
              className="w-full p-3 pl-10 rounded-lg bg-black/60 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full p-3 pl-10 rounded-lg bg-black/60 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {error && <p className="text-red-500 text-center text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className={`w-full px-6 py-3 rounded-lg font-semibold text-lg flex items-center justify-center gap-2 transition-all duration-300 ${
              loading
                ? 'bg-gray-600 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-indigo-600 hover:to-purple-600 shadow-lg'
            }`}
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin w-6 h-6 mr-3" /> {/* Using Lucide's Loader2 */}
                Logging in...
              </>
            ) : (
              'Login'
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-gray-400">
          Don’t have an account?{' '}
          <Link to="/signup" className="text-purple-400 hover:underline font-semibold">
            Sign Up
          </Link>
        </p>
      </motion.div>
    </section>
  );
}
