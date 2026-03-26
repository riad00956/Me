import { useState } from 'react';
import { ArrowLeft, RefreshCw, Trash2, Moon, Sun } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface SettingsProps {
  onBack: () => void;
  primaryColor: string;
  onColorChange: (color: string) => void;
  onClearData: () => void;
  botToken: string | null;
}

const COLORS = [
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Purple', value: '#a855f7' },
  { name: 'Pink', value: '#ec4899' },
  { name: 'Red', value: '#ef4444' },
  { name: 'Orange', value: '#f97316' },
  { name: 'Green', value: '#22c55e' },
  { name: 'Teal', value: '#14b8a6' },
  { name: 'Indigo', value: '#6366f1' },
];

const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

export default function Settings({ onBack, primaryColor, onColorChange, onClearData, botToken }: SettingsProps) {
  const { isDarkMode, toggleTheme } = useTheme();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    if (!botToken) return;
    setIsRefreshing(true);
    try {
      await fetch(`${API_BASE}/api/bot/init`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: botToken }),
      });
      await new Promise(r => setTimeout(r, 800));
    } catch {
    } finally { setIsRefreshing(false); }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-[#0f0f0f]">
      <header className="px-3 py-2 flex items-center gap-3 bg-white dark:bg-[#1a1a1a] border-b border-gray-100 dark:border-gray-800 shadow-sm">
        <button onClick={onBack} className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full active:scale-90 transition-all">
          <ArrowLeft className="w-4 h-4 text-gray-600 dark:text-gray-300" />
        </button>
        <h1 className="text-sm font-bold text-gray-900 dark:text-white">Settings</h1>
      </header>

      <div className="flex-1 overflow-y-auto p-3 space-y-3">

        {/* Appearance */}
        <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800">
          <div className="px-4 py-2.5 border-b border-gray-100 dark:border-gray-800">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Appearance</p>
          </div>
          <div className="px-4 py-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Dark Mode</span>
              <button onClick={toggleTheme}
                className={`w-11 h-6 rounded-full transition-colors flex items-center px-0.5 ${isDarkMode ? 'bg-blue-500 justify-end' : 'bg-gray-200 justify-start'}`}>
                <div className="w-5 h-5 bg-white rounded-full shadow flex items-center justify-center">
                  {isDarkMode ? <Moon className="w-2.5 h-2.5 text-blue-500" /> : <Sun className="w-2.5 h-2.5 text-yellow-500" />}
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Theme Color */}
        <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800">
          <div className="px-4 py-2.5 border-b border-gray-100 dark:border-gray-800">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Theme Color</p>
          </div>
          <div className="px-4 py-3">
            <div className="grid grid-cols-4 gap-2.5">
              {COLORS.map(c => (
                <button key={c.value} onClick={() => onColorChange(c.value)}
                  className="flex flex-col items-center gap-1.5">
                  <div className={`w-9 h-9 rounded-2xl transition-all ${primaryColor === c.value ? 'scale-110 ring-2 ring-offset-2 ring-current dark:ring-offset-[#1a1a1a]' : 'hover:scale-105'}`}
                    style={{ backgroundColor: c.value, color: c.value }}>
                    {primaryColor === c.value && (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-white text-xs font-bold">✓</span>
                      </div>
                    )}
                  </div>
                  <span className="text-[9px] text-gray-500 dark:text-gray-400">{c.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Bot */}
        <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800">
          <div className="px-4 py-2.5 border-b border-gray-100 dark:border-gray-800">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Bot Management</p>
          </div>
          <button onClick={handleRefresh} disabled={isRefreshing}
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors border-b border-gray-50 dark:border-gray-800">
            <RefreshCw className={`w-4 h-4 text-blue-500 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{isRefreshing ? 'Refreshing...' : 'Refresh Bot'}</span>
          </button>
          <button onClick={onClearData}
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors">
            <Trash2 className="w-4 h-4 text-red-500" />
            <span className="text-sm font-medium text-red-500">Clear All Data</span>
          </button>
        </div>

        <p className="text-center text-[10px] text-gray-400 dark:text-gray-600 font-medium py-2">
          Memegram v1.3.0 · Premium Bot Client
        </p>
      </div>
    </div>
  );
}
