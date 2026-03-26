import { useState } from 'react';
import { ArrowLeft, Send, Megaphone, CheckCircle2 } from 'lucide-react';
import { Chat } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface BroadcastScreenProps {
  chats: Chat[];
  botToken: string | null;
  onBack: () => void;
}

const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

export default function BroadcastScreen({ chats, botToken, onBack }: BroadcastScreenProps) {
  const [message, setMessage] = useState('');
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const toggle = (id: number) => {
    setSelected(prev => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id); else n.add(id);
      return n;
    });
  };

  const selectAll = () => {
    if (selected.size === chats.length) setSelected(new Set());
    else setSelected(new Set(chats.map(c => c.id)));
  };

  const handleSend = async () => {
    if (!message.trim() || selected.size === 0 || !botToken) return;
    setSending(true);
    try {
      await fetch(`${API_BASE}/api/bot/broadcast`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: botToken, chatIds: Array.from(selected), message: message.trim() }),
      });
      setSent(true);
      setTimeout(() => { setSent(false); setMessage(''); setSelected(new Set()); }, 2500);
    } catch {
    } finally { setSending(false); }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-[#0f0f0f]">
      <header className="px-3 py-2 flex items-center gap-3 bg-white dark:bg-[#1a1a1a] border-b border-gray-100 dark:border-gray-800 shadow-sm">
        <button onClick={onBack} className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full active:scale-90 transition-all">
          <ArrowLeft className="w-4 h-4 text-gray-600 dark:text-gray-300" />
        </button>
        <div className="flex items-center gap-2 flex-1">
          <Megaphone className="w-4 h-4 text-blue-500" />
          <h1 className="text-sm font-bold text-gray-900 dark:text-white">Broadcast</h1>
        </div>
        <button onClick={selectAll} className="text-xs font-bold text-blue-500 px-2 py-1 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors">
          {selected.size === chats.length ? 'None' : 'All'}
        </button>
      </header>

      <div className="flex-1 overflow-y-auto">
        <div className="p-3">
          <textarea value={message} onChange={e => setMessage(e.target.value)}
            placeholder="Type your broadcast message..."
            rows={3}
            className="w-full px-3 py-2.5 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-700 rounded-2xl text-sm text-gray-900 dark:text-white placeholder-gray-400 outline-none resize-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all" />
        </div>

        <p className="px-4 text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
          Select Chats ({selected.size}/{chats.length})
        </p>

        <div className="space-y-0">
          {chats.filter(c => !c.blocked).map(chat => (
            <button key={chat.id} onClick={() => toggle(chat.id)}
              className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors border-b border-gray-50 dark:border-gray-800/30 last:border-0">
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${selected.has(chat.id) ? 'bg-blue-500 border-blue-500' : 'border-gray-300 dark:border-gray-600'}`}>
                {selected.has(chat.id) && <CheckCircle2 className="w-3.5 h-3.5 text-white fill-white" />}
              </div>
              <div className="w-8 h-8 rounded-xl bg-blue-500 flex items-center justify-center">
                {chat.photoUrl
                  ? <img src={chat.photoUrl} alt={chat.first_name} className="w-8 h-8 rounded-xl object-cover" referrerPolicy="no-referrer" />
                  : <span className="text-white text-xs font-bold">{chat.first_name[0]}</span>
                }
              </div>
              <div className="flex-1 text-left min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{chat.first_name}</p>
                {chat.username && <p className="text-[10px] text-gray-400">@{chat.username}</p>}
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="px-3 pb-4 pt-2 bg-white dark:bg-[#1a1a1a] border-t border-gray-100 dark:border-gray-800">
        <AnimatePresence mode="wait">
          {sent ? (
            <motion.div key="sent" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="flex items-center justify-center gap-2 py-3 bg-green-500 rounded-2xl">
              <CheckCircle2 className="w-4 h-4 text-white" />
              <span className="text-white font-bold text-sm">Sent to {selected.size} chats!</span>
            </motion.div>
          ) : (
            <motion.button key="send" onClick={handleSend}
              disabled={!message.trim() || selected.size === 0 || sending}
              className="w-full flex items-center justify-center gap-2 py-3 bg-blue-500 rounded-2xl text-white font-bold text-sm shadow-lg shadow-blue-500/25 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] transition-all">
              {sending
                ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                : <Send className="w-4 h-4" />
              }
              {sending ? 'Sending...' : `Send to ${selected.size} chat${selected.size !== 1 ? 's' : ''}`}
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
