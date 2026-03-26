import { motion, AnimatePresence } from 'motion/react';
import { 
  Settings, 
  Info, 
  HelpCircle, 
  LogOut, 
  X, 
  Bot, 
  PlusCircle, 
  CheckCircle2,
  Moon,
  Sun
} from 'lucide-react';
import { BotInfo } from '../types';
import { useTheme } from '../context/hooks/useTheme';

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

export default function Sidebar({ 
  isOpen, 
  onClose, 
  onLogout, 
  onNavigate,
  bots,
  activeBotToken,
  onSwitchBot,
  onAddBot,
  showAddBot
}: SidebarProps) {
  const { isDark, toggleTheme } = useTheme();

  const menuItems = [
    { icon: <Settings className="w-5 h-5 text-primary" />, label: 'Settings', view: 'settings' as const },
    { icon: <HelpCircle className="w-5 h-5 text-purple-500" />, label: 'Help / FAQ', view: 'help' as const },
    { icon: <Info className="w-5 h-5 text-orange-500" />, label: 'About', view: 'about' as const },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
          />
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 left-0 bottom-0 w-80 bg-white dark:bg-[#1c1c1c] z-50 shadow-2xl flex flex-col"
          >
            {/* Sidebar Header */}
            <div className="p-6 border-b border-gray-100 dark:border-gray-800">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-hover rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
                    <Bot className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="font-bold text-gray-900 dark:text-white">Memegram</h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Premium Bot Manager</p>
                  </div>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Bot List */}
              <div className="space-y-2">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2 mb-2">Your Bots ({bots.length}/3)</p>
                {bots.map((bot) => (
                  <button
                    key={bot.token}
                    onClick={() => onSwitchBot(bot.token)}
                    className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-all ${
                      activeBotToken === bot.token 
                        ? 'bg-primary/10 border border-primary/20' 
                        : 'hover:bg-gray-50 dark:hover:bg-gray-800 border border-transparent'
                    }`}
                  >
                    <div className="relative">
                      {bot.photoUrl ? (
                        <img src={bot.photoUrl} alt={bot.first_name} className="w-10 h-10 rounded-xl object-cover" />
                      ) : (
                        <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center">
                          <Bot className="w-5 h-5 text-gray-400" />
                        </div>
                      )}
                      {activeBotToken === bot.token && (
                        <div className="absolute -top-1 -right-1 bg-white dark:bg-[#1c1c1c] rounded-full p-0.5">
                          <CheckCircle2 className="w-4 h-4 text-primary fill-primary/10" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      <p className={`text-sm font-semibold truncate ${activeBotToken === bot.token ? 'text-primary' : 'text-gray-700 dark:text-gray-200'}`}>
                        {bot.first_name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">@{bot.username}</p>
                    </div>
                  </button>
                ))}
                
                {showAddBot && (
                  <button
                    onClick={onAddBot}
                    className="w-full flex items-center gap-3 p-3 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700 hover:border-primary dark:hover:border-primary hover:bg-primary/5 dark:hover:bg-primary/5 transition-all group"
                  >
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gray-50 dark:bg-gray-800 group-hover:bg-primary/10 dark:group-hover:bg-primary/10 transition-colors">
                      <PlusCircle className="w-5 h-5 text-gray-400 group-hover:text-primary transition-colors" />
                    </div>
                    <span className="text-sm font-medium text-gray-500 group-hover:text-primary transition-colors">Add New Bot</span>
                  </button>
                )}
              </div>
            </div>

            {/* Menu Items */}
            <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
              {menuItems.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    onNavigate(item.view);
                    onClose();
                  }}
                  className="w-full flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-2xl transition-all group"
                >
                  {item.icon}
                  <span className="font-medium text-gray-700 dark:text-gray-200">{item.label}</span>
                </button>
              ))}

              <button
                onClick={toggleTheme}
                className="w-full flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-2xl transition-all group"
              >
                {isDark ? (
                  <Sun className="w-5 h-5 text-yellow-500 group-hover:rotate-45 transition-transform" />
                ) : (
                  <Moon className="w-5 h-5 text-blue-600 group-hover:-rotate-12 transition-transform" />
                )}
                <span className="font-medium text-gray-700 dark:text-gray-200">
                  {isDark ? 'Light Mode' : 'Dark Mode'}
                </span>
              </button>
            </div>

            {/* Logout */}
            <div className="p-6 border-t border-gray-100 dark:border-gray-800">
              <button
                onClick={onLogout}
                className="w-full flex items-center gap-4 p-4 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-2xl transition-all group"
              >
                <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                <span className="font-bold">Logout</span>
              </button>
              <p className="mt-4 text-center text-[10px] text-gray-400 font-medium uppercase tracking-widest">
                Version 2.0.0 • Premium
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
