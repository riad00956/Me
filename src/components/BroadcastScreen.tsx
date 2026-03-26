import React, { useState } from 'react';
  import { ArrowLeft, Send, Users, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
  import { Chat } from '../types';
  import { motion, AnimatePresence } from 'motion/react';
  import { cn } from '../lib/utils';

  interface BroadcastScreenProps {
    chats: Chat[];
    botToken: string;
    onBack: () => void;
  }

  export default function BroadcastScreen({ chats, botToken, onBack }: BroadcastScreenProps) {
    const [message, setMessage] = useState('');
    const [sending, setSending] = useState(false);
    const [results, setResults] = useState<{sent: number; failed: number; total: number} | null>(null);
    const [progress, setProgress] = useState(0);
    const [targetAll, setTargetAll] = useState(true);
    const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

    const eligible = chats.filter(c => targetAll ? !c.blocked : !c.blocked);

    const handleBroadcast = async () => {
      if (!message.trim() || sending) return;
      setSending(true); setResults(null); setProgress(0);
      let sent = 0, failed = 0;
      for (let i = 0; i < eligible.length; i++) {
        try {
          const res = await fetch(`${API_BASE}/api/bot/send`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token: botToken, chatId: eligible[i].id, text: message.trim() })
          });
          if (res.ok) sent++; else failed++;
        } catch { failed++; }
        setProgress(Math.round(((i + 1) / eligible.length) * 100));
        await new Promise(r => setTimeout(r, 150)); // rate limit delay
      }
      setSending(false); setResults({ sent, failed, total: eligible.length });
    };

    return (
      <div className="flex flex-col h-full bg-white dark:bg-[#121212]">
        <header className="flex items-center gap-3 px-3 py-2.5 bg-white dark:bg-[#1a1a1a] border-b border-gray-100 dark:border-gray-800 shadow-sm">
          <button onClick={onBack} className="w-9 h-9 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
          <div>
            <h2 className="text-sm font-bold text-gray-900 dark:text-white">Broadcast Message</h2>
            <p className="text-[10px] text-gray-400">{eligible.length} users will receive this</p>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Target */}
          <div className="flex gap-2">
            {[{ label: 'All Active Users', value: true }, { label: 'Unblocked Only', value: false }].map(opt => (
              <button key={String(opt.value)} onClick={() => setTargetAll(opt.value)}
                className={cn('flex-1 py-2 rounded-xl text-xs font-semibold border transition-all', targetAll === opt.value ? 'bg-primary text-white border-primary' : 'border-gray-200 dark:border-gray-700 text-gray-500')}>
                {opt.label}
              </button>
            ))}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3">
            {[{icon:'👥', label:'Total Chats', value: chats.length}, {icon:'✅', label:'Will Receive', value: eligible.length}].map(s => (
              <div key={s.label} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl text-center">
                <div className="text-2xl">{s.icon}</div>
                <div className="text-lg font-bold text-gray-900 dark:text-white">{s.value}</div>
                <div className="text-[10px] text-gray-400">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Message */}
          <div>
            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5 block">Your Message</label>
            <textarea value={message} onChange={e => setMessage(e.target.value)} rows={5}
              placeholder="Type your broadcast message here...\n\nYou can use multiple lines." disabled={sending}
              className="w-full p-3 bg-gray-50 dark:bg-gray-800 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/40 dark:text-white resize-none border border-gray-100 dark:border-gray-700 disabled:opacity-50" />
            <p className="text-[10px] text-gray-400 mt-1 text-right">{message.length} characters</p>
          </div>

          {/* Progress */}
          <AnimatePresence>
            {sending && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-3 bg-blue-50 dark:bg-blue-500/10 rounded-xl space-y-2">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
                  <span className="text-xs font-medium text-blue-600 dark:text-blue-400">Sending... {progress}%</span>
                </div>
                <div className="w-full bg-blue-100 dark:bg-blue-900 rounded-full h-1.5">
                  <motion.div animate={{ width: `${progress}%` }} className="bg-blue-500 h-1.5 rounded-full" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Results */}
          <AnimatePresence>
            {results && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl space-y-3">
                <h4 className="text-sm font-bold text-gray-900 dark:text-white">Broadcast Complete!</h4>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center gap-2 p-2 bg-green-50 dark:bg-green-500/10 rounded-xl">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <div><p className="text-base font-bold text-green-600">{results.sent}</p><p className="text-[10px] text-gray-400">Sent</p></div>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-red-50 dark:bg-red-500/10 rounded-xl">
                    <XCircle className="w-4 h-4 text-red-500" />
                    <div><p className="text-base font-bold text-red-600">{results.failed}</p><p className="text-[10px] text-gray-400">Failed</p></div>
                  </div>
                </div>
                <button onClick={() => { setResults(null); setMessage(''); }} className="w-full py-2 text-xs font-semibold text-primary border border-primary/30 rounded-xl hover:bg-primary/5 transition-colors">
                  Send Another Broadcast
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Send button */}
        <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1a1a1a]">
          <button onClick={handleBroadcast} disabled={!message.trim() || sending || eligible.length === 0}
            className={cn('w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all active:scale-95',
              message.trim() && !sending && eligible.length > 0 ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'bg-gray-200 dark:bg-gray-700 text-gray-400')}>
            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            {sending ? 'Sending...' : `Send to ${eligible.length} users`}
          </button>
        </div>
      </div>
    );
  }
  