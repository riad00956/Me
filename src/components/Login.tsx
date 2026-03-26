import { useState } from 'react';
import { motion } from 'motion/react';
import { Moon, Sun, Lock, ArrowRight, Bot } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface LoginProps {
  onLogin: (token: string) => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const { isDarkMode, toggleTheme } = useTheme();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!token.trim()) return;
    setLoading(true);
    setTimeout(() => {
      onLogin(token.trim());
      setLoading(false);
    }, 600);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-[#1c1c1c] overflow-hidden relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[250px] bg-blue-500/10 blur-[100px] pointer-events-none" />

      <header className="px-4 pt-3 pb-2 flex justify-between items-center relative z-10 safe-top">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Bot className="text-white w-4 h-4" />
          </div>
          <h1 className="text-lg font-black text-gray-900 dark:text-white tracking-tighter">Memegram</h1>
        </div>
        <button onClick={toggleTheme} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all active:scale-90">
          {isDarkMode ? <Sun className="w-4 h-4 text-yellow-500" /> : <Moon className="w-4 h-4 text-blue-500" />}
        </button>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-5 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm"
        >
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="w-16 h-16 bg-blue-500 rounded-[22px] flex items-center justify-center shadow-xl shadow-blue-500/30 mx-auto mb-4"
            >
              <Lock className="w-7 h-7 text-white" />
            </motion.div>
            <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tighter">Connect Your Bot</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1.5 font-medium leading-snug">
              Enter your Telegram bot token to get started
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="relative">
              <input
                type="text"
                value={token}
                onChange={e => setToken(e.target.value)}
                placeholder="123456789:ABCdef..."
                className="w-full px-4 py-3.5 bg-gray-50 dark:bg-[#2a2a2a] border border-gray-200 dark:border-gray-700 rounded-2xl text-sm text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
                autoComplete="off"
              />
            </div>
            <button
              type="submit"
              disabled={!token.trim() || loading}
              className="w-full py-3.5 bg-blue-500 text-white rounded-2xl font-black text-sm shadow-xl shadow-blue-500/25 flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-600"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Connect Bot</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 p-3.5 bg-blue-50 dark:bg-blue-500/10 rounded-2xl">
            <p className="text-xs text-blue-700 dark:text-blue-400 font-medium leading-relaxed">
              <span className="font-bold">How to get your token:</span> Open Telegram → Search @BotFather → Create new bot → Copy the token
            </p>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
