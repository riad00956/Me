import { ArrowLeft, Send, Globe } from 'lucide-react';
import { motion } from 'motion/react';

interface AboutViewProps {
  onBack: () => void;
  type?: 'about' | 'help';
}

const FAQS = [
  { q: 'How do I add a bot?', a: 'Go to @BotFather on Telegram, create a new bot, and paste the token in the login screen.' },
  { q: 'Why is my bot offline?', a: 'Make sure your bot token is correct and the server is running. Try refreshing from Settings.' },
  { q: 'Can I use multiple bots?', a: 'Yes! You can add up to 3 bots and switch between them from the sidebar.' },
  { q: 'How do reactions work?', a: 'Long press any message to see reaction and action options.' },
  { q: 'How to forward a message?', a: 'Long press the message → tap Forward.' },
];

export default function AboutView({ onBack, type = 'about' }: AboutViewProps) {
  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-[#0f0f0f]">
      <header className="px-3 py-2 flex items-center gap-3 bg-white dark:bg-[#1a1a1a] border-b border-gray-100 dark:border-gray-800 shadow-sm">
        <button onClick={onBack} className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full active:scale-90 transition-all">
          <ArrowLeft className="w-4 h-4 text-gray-600 dark:text-gray-300" />
        </button>
        <h1 className="text-sm font-bold text-gray-900 dark:text-white">
          {type === 'about' ? 'About Memegram' : 'Help & FAQ'}
        </h1>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {type === 'about' ? (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="w-16 h-16 bg-blue-500 rounded-[22px] flex items-center justify-center shadow-xl shadow-blue-500/20">
                <span className="text-3xl font-black text-white">M</span>
              </div>
              <div>
                <h2 className="text-lg font-black text-gray-900 dark:text-white">Memegram</h2>
                <p className="text-blue-500 text-xs font-bold">Version 1.3.0 · Premium</p>
              </div>
            </div>

            <div className="bg-white dark:bg-[#1a1a1a] p-4 rounded-2xl border border-gray-100 dark:border-gray-800 space-y-3">
              <p className="text-gray-600 dark:text-gray-300 text-xs leading-relaxed">
                Memegram is a premium Telegram bot management app with a beautiful, feature-rich interface. Manage your bots, send messages, reactions, forward, and much more.
              </p>
              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                  <p className="text-[9px] text-gray-400 uppercase font-bold tracking-wider mb-0.5">Developer</p>
                  <p className="text-xs font-bold text-gray-800 dark:text-white">@zerox6t9</p>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                  <p className="text-[9px] text-gray-400 uppercase font-bold tracking-wider mb-0.5">Provider</p>
                  <p className="text-xs font-bold text-gray-800 dark:text-white">Prime Xyron</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
              <p className="px-4 py-2.5 text-[9px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 dark:border-gray-800">Connect</p>
              <a href="https://t.me/prime_xyron" target="_blank" rel="noreferrer"
                className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors border-b border-gray-50 dark:border-gray-800">
                <Send className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Telegram Channel</span>
              </a>
              <a href="https://primexyron.com" target="_blank" rel="noreferrer"
                className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <Globe className="w-4 h-4 text-green-500" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Website</span>
              </a>
            </div>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Frequently Asked Questions</p>
            {FAQS.map((faq, i) => (
              <div key={i} className="bg-white dark:bg-[#1a1a1a] p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
                <p className="text-sm font-bold text-gray-900 dark:text-white mb-1.5">{faq.q}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
