import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Moon, Sun, Lock, ArrowRight, Bot } from 'lucide-react';
import { useTheme } from '../context/hooks/useTheme';

interface LoginProps {
  onLogin: (token: string) => void;
  onBack?: () => void;
}

export default function Login({ onLogin, onBack }: LoginProps) {
  const [token, setToken] = useState('');
  const { isDarkMode, toggleTheme } = useTheme();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (token.trim()) {
      onLogin(token.trim());
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-[#1c1c1c] transition-colors duration-500 overflow-hidden relative">
      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary/10 blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="p-6 flex justify-between items-center relative z-10">
        <div className="flex items-center gap-3">
          {onBack && (
            <button 
              onClick={onBack}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all active:scale-90 mr-2"
            >
              <ArrowRight className="w-6 h-6 text-gray-500 rotate-180" />
            </button>
          )}
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
            <Bot className="text-white w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tighter">
            Memegram
          </h1>
        </div>
        <button
          onClick={toggleTheme}
          className="p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-2xl transition-all active:scale-90"
        >
          {isDarkMode ? <Sun className="text-yellow-500" /> : <Moon className="text-primary" />}
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="text-center mb-10">
            <h2 className="text-4xl font-black text-gray-900 dark:text-white mb-3 tracking-tight">
              Welcome Back
            </h2>
            <p className="text-gray-500 dark:text-gray-400 font-medium">
              Enter your bot token to access your dashboard
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-primary transition-colors" />
              </div>
              <input
                type="password"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Telegram Bot Token"
                className="block w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-[#242424] border-2 border-transparent focus:border-primary rounded-2xl text-gray-900 dark:text-white placeholder-gray-400 outline-none transition-all"
              />
            </div>
            <button
              type="submit"
              disabled={!token.trim()}
              className="w-full py-4 bg-primary hover:bg-primary-hover disabled:bg-gray-300 dark:disabled:bg-gray-800 text-white font-black rounded-2xl shadow-xl shadow-primary/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2 group"
            >
              <span>Connect Bot</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="p-8 text-center relative z-10">
        <p className="text-[10px] font-bold text-gray-400 dark:text-gray-600 uppercase tracking-[0.4em]">
          powered by ꪑꫀꪑꫀ ꪜꪖ꠸ꪗꪖ
        </p>
      </footer>
    </div>
  );
}
