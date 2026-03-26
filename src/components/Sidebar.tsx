import { motion, AnimatePresence } from 'motion/react';
import { Settings, Info, HelpCircle, LogOut, X, Bot, PlusCircle, CheckCircle2, Moon, Sun } from 'lucide-react';
import { BotInfo } from '../types';
import { useTheme } from '../context/ThemeContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
  onNavigate: (view: 'chats' | 'settings' | 'about' | 'help') => void;
  bots: BotInfo[];
  activeBotToken: string | null;
  onSwitchBot: (token: string) => void;
  onAddBot: () => void;
  showAddBot: boolean;
}

export default function Sidebar({ isOpen, onClose, onLogout, onNavigate, bots, activeBotToken, onSwitchBot, onAddBot, showAddBot }: SidebarProps) {
  const { isDarkMode, toggleTheme } = useTheme();

  const menuItems = [
    { icon: <Settings className="w-4 h-4 text-blue-500" />, label: 'Settings', view: 'settings' as const },
    { icon: <HelpCircle className="w-4 h-4 text-purple-500" />, label: 'Help / FAQ', view: 'help' as const },
    { icon: <Info className="w-4 h-4 text-orange-500" />, label: 'About', view: 'about' as const },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose} className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" />
          <motion.div
            initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 250 }}
            className="fixed top-0 left-0 bottom-0 w-[260px] bg-white dark:bg-[#1a1a1a] z-50 shadow-2xl flex flex-col">

            {/* Header */}
            <div className="px-4 pt-4 pb-3 border-b border-gray-100 dark:border-gray-800">
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-500 rounded-xl flex items-center justify-center shadow-md shadow-blue-500/20">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h2 className="text-sm font-black text-gray-900 dark:text-white">Memegram</h2>
                    <p className="text-[9px] text-gray-400">Premium Bot Manager</p>
                  </div>
                </div>
                <button onClick={onClose} className="w-7 h-7 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
                  <X className="w-3.5 h-3.5 text-gray-500" />
                </button>
              </div>

              {/* Bots */}
              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Your Bots ({bots.length}/3)</p>
              <div className="space-y-1">
                {bots.map(bot => (
                  <button key={bot.token} onClick={() => { onSwitchBot(bot.token); onClose(); }}
                    className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-xl transition-all ${activeBotToken === bot.token ? 'bg-blue-500/10 border border-blue-500/20' : 'hover:bg-gray-50 dark:hover:bg-gray-800 border border-transparent'}`}>
                    <div className="relative">
                      {bot.photoUrl
                        ? <img src={bot.photoUrl} alt={bot.first_name} className="w-7 h-7 rounded-xl object-cover" referrerPolicy="no-referrer" />
                        : <div className="w-7 h-7 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center">
                            <Bot className="w-3.5 h-3.5 text-gray-400" />
                          </div>
                      }
                      {activeBotToken === bot.token && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-white dark:bg-[#1a1a1a] rounded-full flex items-center justify-center">
                          <CheckCircle2 className="w-2.5 h-2.5 text-blue-500 fill-blue-500" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <p className={`text-xs font-bold truncate ${activeBotToken === bot.token ? 'text-blue-600 dark:text-blue-400' : 'text-gray-800 dark:text-gray-200'}`}>
                        {bot.first_name}
                      </p>
                      <p className="text-[9px] text-gray-400 truncate">@{bot.username || 'bot'}</p>
                    </div>
                  </button>
                ))}
                {showAddBot && (
                  <button onClick={() => { onAddBot(); onClose(); }}
                    className="w-full flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 border border-dashed border-gray-300 dark:border-gray-700 transition-all">
                    <div className="w-7 h-7 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                      <PlusCircle className="w-3.5 h-3.5 text-gray-400" />
                    </div>
                    <span className="text-xs text-gray-500 font-medium">Add Bot</span>
                  </button>
                )}
              </div>
            </div>

            {/* Menu */}
            <div className="flex-1 overflow-y-auto px-3 py-2">
              {menuItems.map(item => (
                <button key={item.view} onClick={() => { onNavigate(item.view); onClose(); }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  {item.icon}
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{item.label}</span>
                </button>
              ))}
            </div>

            {/* Footer */}
            <div className="px-3 pb-4 border-t border-gray-100 dark:border-gray-800 pt-2 space-y-1">
              <button onClick={toggleTheme}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                {isDarkMode
                  ? <Sun className="w-4 h-4 text-yellow-500" />
                  : <Moon className="w-4 h-4 text-gray-500" />
                }
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
              </button>
              <button onClick={() => { onLogout(); onClose(); }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors">
                <LogOut className="w-4 h-4 text-red-500" />
                <span className="text-sm font-medium text-red-500">Remove Bot</span>
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
