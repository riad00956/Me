import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Search, Menu, Circle, BellOff, Pin } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Chat } from '../types';

interface ChatListProps {
  chats: Chat[];
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onSelectChat: (chat: Chat) => void;
  onOpenMenu: () => void;
  botToken: string | null;
}

const COLORS = ['bg-blue-500','bg-green-500','bg-purple-500','bg-orange-500','bg-pink-500','bg-indigo-500','bg-teal-500','bg-red-500'];
const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

export default function ChatList({ chats, searchQuery, onSearchChange, onSelectChat, onOpenMenu, botToken }: ChatListProps) {
  const [isBotOnline, setIsBotOnline] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const totalUnread = chats.reduce((sum, c) => sum + (c.unreadCount || 0), 0);

  useEffect(() => {
    const check = async () => {
      if (!botToken) return;
      try {
        const res = await fetch(`${API_BASE}/api/bot/status?token=${encodeURIComponent(botToken)}`);
        const d = await res.json();
        setIsBotOnline(d.initialized);
      } catch { setIsBotOnline(false); }
    };
    check();
    const id = setInterval(check, 5000);
    return () => clearInterval(id);
  }, [botToken]);

  const sorted = [...chats].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return (b.lastMessage?.timestamp || 0) - (a.lastMessage?.timestamp || 0);
  });

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#121212]">
      {/* Header */}
      <header className="px-3 pt-2 pb-1.5 bg-white dark:bg-[#1a1a1a] border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center justify-between h-9">
          <div className="flex items-center gap-2">
            <button onClick={onOpenMenu}
              className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full relative">
              <Menu className="w-4.5 h-4.5 text-gray-600 dark:text-gray-300" />
              {totalUnread > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-red-500 text-white text-[8px] font-bold rounded-full flex items-center justify-center">
                  {totalUnread > 9 ? '9+' : totalUnread}
                </span>
              )}
            </button>
            <div>
              <h1 className="text-sm font-black text-gray-900 dark:text-white leading-tight">Memegram</h1>
              <div className="flex items-center gap-1">
                <Circle className={`w-1.5 h-1.5 fill-current ${isBotOnline ? 'text-green-500' : 'text-red-500'}`} />
                <span className="text-[9px] font-semibold text-gray-400 uppercase tracking-wide">
                  {isBotOnline ? 'Online' : 'Offline'}
                </span>
              </div>
            </div>
          </div>
          <button onClick={() => setShowSearch(s => !s)}
            className={`w-8 h-8 flex items-center justify-center rounded-full transition-colors ${showSearch ? 'bg-blue-500/10 text-blue-500' : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500'}`}>
            <Search className="w-4 h-4" />
          </button>
        </div>

        <AnimatePresence>
          {showSearch && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden pt-1.5">
              <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-xl px-3 py-1.5 gap-2">
                <Search className="w-3 h-3 text-gray-400 shrink-0" />
                <input autoFocus type="text" placeholder="Search chats..." value={searchQuery}
                  onChange={e => onSearchChange(e.target.value)}
                  className="flex-1 bg-transparent text-xs text-gray-900 dark:text-white outline-none placeholder-gray-400" />
                {searchQuery && (
                  <button onClick={() => onSearchChange('')} className="text-gray-400 text-xs">✕</button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {sorted.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-6">
            <div className="w-14 h-14 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center mb-3">
              <span className="text-2xl">💬</span>
            </div>
            <p className="text-sm font-bold text-gray-500 dark:text-gray-400">No chats yet</p>
            <p className="text-xs text-gray-400 dark:text-gray-600 mt-1">Messages will appear here</p>
          </div>
        ) : (
          sorted.map((chat, idx) => {
            const color = COLORS[Math.abs(chat.id) % COLORS.length];
            const lastMsg = chat.lastMessage;
            const time = lastMsg ? format(lastMsg.timestamp, 'HH:mm') : '';
            const preview = lastMsg
              ? lastMsg.type === 'text' ? lastMsg.content
              : lastMsg.type === 'photo' ? '📷 Photo'
              : lastMsg.type === 'video' ? '🎬 Video'
              : lastMsg.type === 'document' ? '📎 Document'
              : lastMsg.type === 'voice' ? '🎤 Voice'
              : lastMsg.type === 'audio' ? '🎵 Audio'
              : '📎 File'
              : '';

            return (
              <motion.button key={chat.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.02 }}
                onClick={() => onSelectChat(chat)}
                className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800/50 active:bg-gray-100 dark:active:bg-gray-800 transition-colors border-b border-gray-50 dark:border-gray-800/30 last:border-0">

                {/* Avatar */}
                <div className="relative shrink-0">
                  {chat.photoUrl ? (
                    <img src={chat.photoUrl} alt={chat.first_name} referrerPolicy="no-referrer"
                      className="w-11 h-11 rounded-2xl object-cover" />
                  ) : (
                    <div className={`w-11 h-11 rounded-2xl ${color} flex items-center justify-center`}>
                      <span className="text-base font-bold text-white">{chat.first_name[0]?.toUpperCase()}</span>
                    </div>
                  )}
                  {chat.pinned && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                      <Pin className="w-2 h-2 text-white fill-current" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-sm font-bold text-gray-900 dark:text-white truncate pr-2">
                      {chat.first_name} {chat.username ? '' : ''}
                    </span>
                    <span className="text-[10px] text-gray-400 shrink-0">{time}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`text-xs truncate pr-2 ${chat.blocked ? 'text-red-400' : 'text-gray-500 dark:text-gray-400'}`}>
                      {chat.blocked ? '🚫 Blocked' : preview}
                    </span>
                    <div className="flex items-center gap-1 shrink-0">
                      {chat.muted && <BellOff className="w-3 h-3 text-gray-400" />}
                      {(chat.unreadCount || 0) > 0 && !chat.muted && (
                        <span className="min-w-[18px] h-[18px] bg-blue-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                          {(chat.unreadCount || 0) > 99 ? '99+' : chat.unreadCount}
                        </span>
                      )}
                      {(chat.unreadCount || 0) > 0 && chat.muted && (
                        <span className="min-w-[18px] h-[18px] bg-gray-300 dark:bg-gray-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                          {chat.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </motion.button>
            );
          })
        )}
      </div>
    </div>
  );
}
