import { format } from 'date-fns';
import { Search, Menu, User, Circle, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Chat } from '../types';
import { useEffect, useState } from 'react';
import { cn } from '../lib/utils';

interface ChatListProps {
  chats: Chat[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSelectChat: (chat: Chat) => void;
  onOpenMenu: () => void;
  botToken: string | null;
}

const colors = [
  'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 
  'bg-pink-500', 'bg-indigo-500', 'bg-teal-500', 'bg-red-500'
];

export default function ChatList({ chats, searchQuery, onSearchChange, onSelectChat, onOpenMenu, botToken }: ChatListProps) {
  const [isBotOnline, setIsBotOnline] = useState(false);
  const [botError, setBotError] = useState<string | null>(null);
  const [showSearch, setShowSearch] = useState(false);

  useEffect(() => {
    const checkStatus = async () => {
      if (!botToken) return;
      try {
        const res = await fetch(`/api/bot/status?token=${encodeURIComponent(botToken)}`);
        const data = await res.json();
        setIsBotOnline(data.initialized);
        setBotError(data.error);
      } catch (e) {
        setIsBotOnline(false);
        setBotError(null);
      }
    };
    checkStatus();
    const interval = setInterval(checkStatus, 5000);
    return () => clearInterval(interval);
  }, [botToken]);

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#1c1c1c] transition-colors">
      {/* Header */}
      <header className="p-2 flex flex-col gap-2 bg-white dark:bg-[#1c1c1c] border-b border-gray-100 dark:border-gray-800 z-10 transition-all duration-300">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenMenu}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
            >
              <Menu className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </button>
            <div>
              <h1 className="text-lg font-bold text-gray-800 dark:text-white leading-tight">Memegram</h1>
              <div className="flex items-center gap-1">
                <Circle className={cn("w-2 h-2 fill-current", isBotOnline ? "text-green-500" : "text-red-500")} />
                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">
                  {isBotOnline ? 'Bot Live' : 'Bot Offline'}
                </span>
              </div>
            </div>
          </div>
          <button 
            onClick={() => setShowSearch(!showSearch)}
            className={cn("p-2 rounded-full transition-colors", showSearch ? "bg-primary/10 text-primary" : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300")}
          >
            <Search className="w-5 h-5" />
          </button>
        </div>

        {showSearch && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative"
          >
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search chats..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 dark:text-white transition-all"
              autoFocus
            />
          </motion.div>
        )}
      </header>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {chats.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
              <User className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-700 dark:text-gray-200">No chats yet</h3>
            <p className="text-gray-500 dark:text-gray-400 mt-2">
              Any user who messages your bot will appear here.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50 dark:divide-gray-800">
            {chats.map((chat) => (
              <button
                key={chat.id}
                onClick={() => onSelectChat(chat)}
                className="w-full flex items-center gap-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors text-left"
              >
                <div className="relative">
                  {chat.photoUrl ? (
                    <img 
                      src={chat.photoUrl} 
                      alt={chat.first_name} 
                      className="w-10 h-10 rounded-full object-cover border border-gray-100 dark:border-gray-800 shadow-sm"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md",
                      colors[chat.id % colors.length]
                    )}>
                      {chat.first_name[0]}
                    </div>
                  )}
                  {chat.blocked && (
                    <div className="absolute -bottom-1 -right-1 bg-red-500 rounded-full p-0.5 border-2 border-white dark:border-[#1c1c1c]">
                      <ShieldAlert className="w-2 h-2 text-white" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-0.5">
                    <h3 className="font-bold text-gray-900 dark:text-white truncate text-sm">
                      {chat.first_name}
                    </h3>
                    {chat.lastMessage && (
                      <span className="text-[10px] text-gray-400">
                        {format(chat.lastMessage.timestamp, 'HH:mm')}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {chat.lastMessage ? (
                      chat.lastMessage.type === 'text' ? chat.lastMessage.content : `[${chat.lastMessage.type}]`
                    ) : (
                      `@${chat.username || 'user'}`
                    )}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="p-3 text-center text-[10px] text-gray-400 dark:text-gray-600 font-medium border-t border-gray-50 dark:border-gray-800 bg-white dark:bg-[#1c1c1c]">
        powered by ꪑꫀꪑꫀ ꪜꪖ꠸ꪗꪖ
      </footer>
    </div>
  );
}
