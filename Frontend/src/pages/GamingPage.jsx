import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Gamepad2, Trophy, Users, Clock } from 'lucide-react';

export default function GamingPage() {
  const [selectedGame, setSelectedGame] = useState(null);
  const games = [
    { id: 1, name: 'Code Duel', description: 'Real-time coding battle with other players', icon: '⚔️', players: 234, status: 'Coming Soon' },
    { id: 2, name: 'Algorithm Arena', description: 'Solve algorithmic challenges in a competitive environment', icon: '🏆', players: 156, status: 'Coming Soon' },
    { id: 3, name: 'Bug Hunter', description: 'Find and fix bugs in code snippets before others', icon: '🐛', players: 89, status: 'Coming Soon' },
    { id: 4, name: 'Code Golf', description: 'Write the shortest code to solve problems', icon: '⛳', players: 142, status: 'Coming Soon' },
  ];

  return (
    // ✅ REMOVED ml-56
    <section className="min-h-screen w-full bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 px-4 py-20 overflow-x-hidden">
      <div className="max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Gamepad2 className="w-10 h-10 text-indigo-400" />
            <h1 className="text-5xl font-bold text-white">Gaming Zone</h1>
          </div>
          <p className="text-gray-300 text-lg">Compete with other developers in fun coding challenges</p>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {games.map((game, index) => (
            <motion.div key={game.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}
              onClick={() => setSelectedGame(game)} className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-8 hover:bg-white/10 cursor-pointer transition-all duration-300 hover:scale-105">
              <div className="text-6xl mb-4">{game.icon}</div>
              <h3 className="text-2xl font-bold text-white mb-2">{game.name}</h3>
              <p className="text-gray-300 mb-6">{game.description}</p>
              <div className="flex items-center gap-4 text-sm text-gray-400 mb-6">
                <div className="flex items-center gap-2"><Users size={16} /><span>{game.players} players</span></div>
                <div className="flex items-center gap-2"><Clock size={16} /><span>{game.status}</span></div>
              </div>
              <button disabled className="w-full px-6 py-3 bg-gray-600 text-white rounded-lg font-semibold transition-colors cursor-not-allowed opacity-50">{game.status}</button>
            </motion.div>
          ))}
        </div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-8">
          <h2 className="text-3xl font-bold text-white mb-8 flex items-center gap-3"><Trophy className="text-yellow-400" />Global Leaderboard</h2>
          <div className="space-y-4">
            {[{rank:1,name:'AlgoMaster',score:15420,avatar:'👨‍💻'},{rank:2,name:'CodeNinja',score:14850,avatar:'🥷'},{rank:3,name:'DevGenius',score:14200,avatar:'🧙‍♂️'},{rank:4,name:'ByteBoss',score:13950,avatar:'💼'},{rank:5,name:'PixelPro',score:13600,avatar:'🎨'}].map((player, index) => (
              <motion.div key={player.rank} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 + index * 0.1 }} className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="text-2xl font-bold text-indigo-400 w-8">{player.rank}</div>
                  <div className="text-2xl">{player.avatar}</div>
                  <p className="text-white font-semibold">{player.name}</p>
                </div>
                <p className="text-xl font-bold text-indigo-400">{player.score.toLocaleString()}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1 }} className="mt-12 backdrop-blur-md bg-indigo-600/20 border border-indigo-500/50 rounded-xl p-8 text-center">
          <h3 className="text-3xl font-bold text-white mb-4">More Games Coming Soon!</h3>
          <p className="text-gray-300 text-lg mb-6">We're working on even more exciting competitive gaming features. Stay tuned!</p>
          <button className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold transition-colors">Notify Me</button>
        </motion.div>
      </div>
    </section>
  );
}