import { format } from 'date-fns';
  import { Search, Menu, User, Circle, ShieldAlert, BellOff, Pin } from 'lucide-react';
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

  const colors = ['bg-blue-500','bg-green-500','bg-purple-500','bg-orange-500','bg-pink-500','bg-indigo-500','bg-teal-500','bg-red-500'];

  export default function ChatList({ chats, searchQuery, onSearchChange, onSelectChat, onOpenMenu, botToken }: ChatListProps) {
    const [isBotOnline, setIsBotOnline] = useState(false);
    const [showSearch, setShowSearch] = useState(false);
    const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
    const totalUnread = chats.reduce((sum, c) => sum + (c.unreadCount || 0), 0);

    useEffect(() => {
      const check = async () => {
        if (!botToken) return;
        try {
          const res = await fetch(`${API_BASE}/api/bot/status?token=${encodeURIComponent(botToken)}`);
          const d = await res.json(); setIsBotOnline(d.initialized);
        } catch { setIsBotOnline(false); }
      };
      check(); const id = setInterval(check, 5000); return () => clearInterval(id);
    }, [botToken]);

    return (
      <div className="flex flex-col h-full bg-white dark:bg-[#121212]">
        {/* Header */}
        <header className="px-3 py-2 bg-white dark:bg-[#1a1a1a] border-b border-gray-100 dark:border-gray-800 z-10">
          <div className="flex items-center justify-between h-10">
            <div className="flex items-center gap-2">
              <button onClick={onOpenMenu} className="w-9 h-9 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full relative">
                <Menu className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                {totalUnread > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                    {totalUnread > 9 ? '9+' : totalUnread}
                  </span>
                )}
              </button>
              <div>
                <h1 className="text-base font-bold text-gray-900 dark:text-white leading-tight">Memegram</h1>
                <div className="flex items-center gap-1">
                  <Circle className={cn("w-1.5 h-1.5 fill-current", isBotOnline ? "text-green-500" : "text-red-500")} />
                  <span className="text-[9px] font-semibold text-gray-400 uppercase tracking-wider">
                    {isBotOnline ? 'Bot Online' : 'Bot Offline'}
                  </span>
                </div>
              </div>
            </div>
            <button onClick={() => setShowSearch(!showSearch)}
              className={cn("w-9 h-9 flex items-center justify-center rounded-full transition-colors",
                showSearch ? "bg-primary/10 text-primary" : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500")}>
              <Search className="w-4 h-4" />
            </button>
          </div>
          <AnimatePresence>
            {showSearch && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden pt-1.5">
                <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-xl px-3 py-1.5 gap-2">
                  <Search className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                  <input autoFocus type="text" placeholder="Search chats..." value={searchQuery} onChange={e => onSearchChange(e.target.value)}
                    className="flex-1 bg-transparent text-xs outline-none dark:text-white placeholder-gray-400" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </header>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto">
          {chats.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-3">
                <User className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-sm font-bold text-gray-700 dark:text-gray-200">No chats yet</h3>
              <p className="text-xs text-gray-500 mt-1">Users who message your bot appear here.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50 dark:divide-gray-800/60">
              {chats.map(chat => (
                <button key={chat.id} onClick={() => onSelectChat(chat)}
                  className="w-full flex items-center gap-2.5 px-3 h-[64px] hover:bg-gray-50 dark:hover:bg-gray-800/40 active:bg-gray-100 dark:active:bg-gray-800 transition-colors text-left">
                  {/* Avatar */}
                  <div className="relative shrink-0">
                    {chat.photoUrl
                      ? <img src={chat.photoUrl} alt={chat.first_name} className="w-10 h-10 rounded-full object-cover border border-gray-100 dark:border-gray-700" referrerPolicy="no-referrer" />
                      : <div className={cn("w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm", colors[chat.id % colors.length])}>{chat.first_name[0]}</div>}
                    {chat.blocked && (
                      <div className="absolute -bottom-0.5 -right-0.5 bg-red-500 rounded-full p-0.5 border-2 border-white dark:border-[#121212]">
                        <ShieldAlert className="w-2 h-2 text-white" />
                      </div>
                    )}
                  </div>
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-1 min-w-0">
                        {chat.pinned && <Pin className="w-2.5 h-2.5 text-primary shrink-0" />}
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate">{chat.first_name}</h3>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0 ml-2">
                        {chat.muted && <BellOff className="w-2.5 h-2.5 text-gray-400" />}
                        {chat.lastMessage && <span className="text-[10px] text-gray-400">{format(chat.lastMessage.timestamp, 'HH:mm')}</span>}
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-0.5">
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate flex-1 mr-2">
                        {chat.lastMessage
                          ? (chat.lastMessage.type === 'text' ? chat.lastMessage.content : `📎 ${chat.lastMessage.type}`)
                          : (chat.username ? `@${chat.username}` : 'No messages yet')}
                      </p>
                      {(chat.unreadCount || 0) > 0 && (
                        <span className={`min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold text-white flex items-center justify-center ${chat.muted ? 'bg-gray-400' : 'bg-primary'}`}>
                          {chat.unreadCount! > 99 ? '99+' : chat.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="py-2 text-center text-[9px] text-gray-400 dark:text-gray-600 border-t border-gray-50 dark:border-gray-800/60">
          powered by ꪑꫀꪑꫀ ꪜꪖ꠸ꪗꪖ
        </footer>
      </div>
    );
  }
  