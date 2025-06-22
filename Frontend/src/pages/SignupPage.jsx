import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User } from 'lucide-react';
import axios from 'axios';
import Spinner from '../components/Spinner';

export default function Signup() {
  const [username, setUsername] = useState('');
  const [fullname, setFullname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await axios.post(
        '/api/v1/auth/signup',
        { username, fullname, email, password },
        { withCredentials: true }
      );
      console.log('Signup successful:', res.data.message || res.data);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed. Please try again.');
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
        <h2 className="text-4xl font-bold text-center mb-2 bg-gradient-to-r from-sky-400 via-purple-500 to-pink-500 text-transparent bg-clip-text">
          Create Your Space Identity
        </h2>
        <p className="text-center text-gray-300 mb-8">Sign up to explore the Aventis galaxy.</p>

        <form onSubmit={handleSignup} className="space-y-6">
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full p-3 pl-10 rounded-lg bg-black/60 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Full Name"
              value={fullname}
              onChange={(e) => setFullname(e.target.value)}
              required
              className="w-full p-3 pl-10 rounded-lg bg-black/60 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
                <Spinner size={20} />
                Creating Account...
              </>
            ) : (
              'Sign Up'
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-gray-400">
          Already have an account?{' '}
          <Link to="/login" className="text-purple-400 hover:underline font-semibold">
            Login
          </Link>
        </p>
      </motion.div>
    </section>
  );
}
