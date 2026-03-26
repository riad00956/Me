import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
  Shield, 
  Trash2, 
  Bell, 
  Lock, 
  Globe, 
  Info, 
  HelpCircle, 
  Edit2, 
  Check, 
  X, 
  Palette,
  Smartphone,
  Moon,
  Sun,
  RefreshCw
} from 'lucide-react';
import { useTheme } from '../context/hooks/useTheme';
import { cn } from '../lib/utils';

interface SettingsProps {
  onBack: () => void;
  onClearData: () => void;
  onUpdateToken: (token: string) => void;
  onNavigate: (view: 'chats' | 'settings' | 'about' | 'help') => void;
  botToken: string;
  primaryColor: string;
  onColorChange: (color: string) => void;
}

const THEME_COLORS = [
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Purple', value: '#a855f7' },
  { name: 'Pink', value: '#ec4899' },
  { name: 'Red', value: '#ef4444' },
  { name: 'Orange', value: '#f97316' },
  { name: 'Green', value: '#22c55e' },
  { name: 'Teal', value: '#14b8a6' },
  { name: 'Indigo', value: '#6366f1' },
];

export default function Settings({ 
  onBack, 
  onClearData, 
  onUpdateToken, 
  onNavigate, 
  botToken,
  primaryColor,
  onColorChange
}: SettingsProps) {
  const { isDarkMode, toggleTheme } = useTheme();
  const [isEditingToken, setIsEditingToken] = useState(false);
  const [newToken, setNewToken] = useState(botToken);

  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleUpdateToken = () => {
    if (newToken.trim()) {
      onUpdateToken(newToken.trim());
      setIsEditingToken(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await fetch('/api/bot/init', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: botToken }),
      });
      // Small delay to show animation
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (e) {
      console.error('Refresh failed:', e);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex flex-col h-full bg-gray-50 dark:bg-[#0a0a0a] transition-colors"
    >
      {/* Header */}
      <header className="p-4 flex items-center gap-4 bg-white dark:bg-[#1c1c1c] border-b border-gray-200 dark:border-gray-800 shadow-sm sticky top-0 z-10">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onBack}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-gray-600 dark:text-gray-300" />
        </motion.button>
        <h1 className="text-xl font-bold text-gray-800 dark:text-white">Settings</h1>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        <div className="max-w-2xl mx-auto space-y-6">
          
          {/* Appearance Section */}
          <div className="space-y-4">
            <h3 className="px-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Appearance</h3>
            <div className="bg-white dark:bg-[#121212] rounded-[2.5rem] border border-gray-100 dark:border-white/5 overflow-hidden shadow-sm">
              <button 
                onClick={toggleTheme}
                className="w-full flex items-center justify-between p-6 hover:bg-gray-50 dark:hover:bg-white/5 transition-all active:scale-[0.99]"
              >
                <div className="flex items-center gap-5">
                  <motion.div 
                    animate={{ 
                      rotate: isDarkMode ? 360 : 0,
                      backgroundColor: isDarkMode ? "rgba(168, 85, 247, 0.1)" : "rgba(59, 130, 246, 0.1)",
                      color: isDarkMode ? "#a855f7" : "#3b82f6"
                    }}
                    transition={{ duration: 0.5, type: "spring", stiffness: 200 }}
                    className="w-12 h-12 rounded-2xl flex items-center justify-center"
                  >
                    {isDarkMode ? <Moon className="w-6 h-6" /> : <Sun className="w-6 h-6" />}
                  </motion.div>
                  <div className="text-left">
                    <p className="font-bold text-gray-900 dark:text-white text-lg">
                      {isDarkMode ? 'Dark Mode' : 'Light Mode'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                      {isDarkMode ? 'Switch to light theme' : 'Switch to dark theme'}
                    </p>
                  </div>
                </div>
                <div className={cn(
                  "w-14 h-7 rounded-full p-1 transition-all duration-500",
                  isDarkMode ? "bg-primary" : "bg-gray-200 dark:bg-gray-800"
                )}>
                  <motion.div 
                    animate={{ x: isDarkMode ? 28 : 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    className="w-5 h-5 bg-white rounded-full shadow-lg"
                  />
                </div>
              </button>

              {/* Theme Color Picker */}
              <div className="p-6 border-t border-gray-50 dark:border-white/5">
                <div className="flex items-center gap-5 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <Palette className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 dark:text-white text-lg">Accent Color</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Personalize your experience</p>
                  </div>
                </div>
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-4">
                  {THEME_COLORS.map((color) => (
                    <button
                      key={color.value}
                      onClick={() => onColorChange(color.value)}
                      className="relative group flex flex-col items-center gap-2"
                      title={color.name}
                    >
                      <motion.div 
                        whileHover={{ scale: 1.15, rotate: 5 }}
                        whileTap={{ scale: 0.9 }}
                        className={cn(
                          "w-full aspect-square rounded-2xl shadow-sm transition-all duration-300 ring-offset-2 dark:ring-offset-[#121212] relative",
                          primaryColor === color.value ? "ring-4 ring-primary scale-110 shadow-lg shadow-primary/20" : "hover:scale-105"
                        )}
                        style={{ backgroundColor: color.value }}
                      >
                        <AnimatePresence>
                          {primaryColor === color.value && (
                            <motion.div 
                              initial={{ opacity: 0, scale: 0.5 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.5 }}
                              className="absolute inset-0 flex items-center justify-center"
                            >
                              <Check className="w-6 h-6 text-white drop-shadow-md" />
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                      <span className={cn(
                        "text-[10px] font-bold uppercase tracking-tighter transition-colors",
                        primaryColor === color.value ? "text-primary" : "text-gray-400"
                      )}>
                        {color.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Security Section */}
          <div className="space-y-3">
            <h3 className="px-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Bot Account</h3>
            <div className="bg-white dark:bg-[#1c1c1c] rounded-3xl border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm">
              <div className="p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-green-50 dark:bg-green-500/10 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-green-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 dark:text-white">Bot Token</p>
                  {isEditingToken ? (
                    <div className="flex items-center gap-2 mt-1">
                      <input
                        type="text"
                        value={newToken}
                        onChange={(e) => setNewToken(e.target.value)}
                        className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-xs w-full focus:outline-none border border-blue-500 dark:text-white"
                        autoFocus
                      />
                      <button onClick={handleUpdateToken} className="p-1 text-green-500"><Check size={16} /></button>
                      <button onClick={() => { setIsEditingToken(false); setNewToken(botToken); }} className="p-1 text-red-500"><X size={16} /></button>
                    </div>
                  ) : (
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{botToken}</p>
                  )}
                </div>
                {!isEditingToken && (
                  <div className="flex items-center gap-1">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={handleRefresh}
                      disabled={isRefreshing}
                      className={cn(
                        "p-2 rounded-xl transition-all",
                        isRefreshing ? "bg-gray-100 dark:bg-gray-800" : "hover:bg-gray-100 dark:hover:bg-gray-800 text-primary"
                      )}
                      title="Refresh Connection"
                    >
                      <RefreshCw className={cn("w-5 h-5", isRefreshing && "animate-spin")} />
                    </motion.button>
                    <button 
                      onClick={() => setIsEditingToken(true)}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
                    >
                      <Edit2 className="w-5 h-5 text-primary" />
                    </button>
                  </div>
                )}
              </div>

              <button 
                onClick={onClearData}
                className="w-full flex items-center gap-4 p-4 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors border-t border-gray-50 dark:border-gray-800 group"
              >
                <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-500/10 flex items-center justify-center group-hover:bg-red-100 dark:group-hover:bg-red-500/20 transition-colors">
                  <Trash2 className="w-5 h-5 text-red-500" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-red-500">Clear App Data</p>
                  <p className="text-xs text-red-400">Delete all chats and messages</p>
                </div>
              </button>
            </div>
          </div>

          {/* About Section */}
          <div className="space-y-3 pb-8">
            <h3 className="px-4 text-xs font-bold text-gray-400 uppercase tracking-widest">About</h3>
            <div className="bg-white dark:bg-[#1c1c1c] rounded-3xl border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm">
              <button 
                onClick={() => onNavigate('about')}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center">
                    <Smartphone className="w-5 h-5 text-orange-500" />
                  </div>
                  <p className="font-semibold text-gray-900 dark:text-white">App Information</p>
                </div>
                <ArrowLeft className="w-5 h-5 text-gray-400 rotate-180" />
              </button>
            </div>
          </div>

          <div className="text-center space-y-1">
            <p className="text-sm font-bold text-gray-400">Memegram Premium</p>
            <p className="text-xs text-gray-500">Version 2.0.0 • Developed by @zerox6t9</p>
            <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-4">「 Prime Xyron 」👨💻</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
