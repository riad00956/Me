import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, User, HelpCircle, Info, Send, Globe } from 'lucide-react';

interface AboutViewProps {
  onBack: () => void;
  type: 'about' | 'help';
}

export default function AboutView({ onBack, type }: AboutViewProps) {
  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-[#0f0f0f] transition-colors">
      <header className="p-4 flex items-center gap-4 bg-white dark:bg-[#1c1c1c] border-b border-gray-200 dark:border-gray-800 shadow-sm">
        <button onClick={onBack} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
          <ArrowLeft className="w-6 h-6 text-gray-600 dark:text-gray-300" />
        </button>
        <h1 className="text-xl font-bold text-gray-800 dark:text-white">
          {type === 'about' ? 'About Memegram' : 'Help & FAQ'}
        </h1>
      </header>

      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        {type === 'about' ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-24 h-24 bg-blue-500 rounded-3xl flex items-center justify-center shadow-xl shadow-blue-500/20">
                <span className="text-5xl font-bold text-white">M</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Memegram</h2>
                <p className="text-blue-500 font-medium">Version 1.3.0 (Premium)</p>
              </div>
            </div>

            <div className="bg-white dark:bg-[#1c1c1c] p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm space-y-4">
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                Memegram is a premium Telegram bot management application. 
                It allows you to manage your Telegram bots with a beautiful, Telegram-like interface.
              </p>
              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl">
                  <p className="text-xs text-gray-400 uppercase font-bold tracking-widest mb-1">Developer</p>
                  <p className="font-bold text-gray-800 dark:text-white">@zerox6t9</p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl">
                  <p className="text-xs text-gray-400 uppercase font-bold tracking-widest mb-1">Provider</p>
                  <p className="font-bold text-gray-800 dark:text-white">Prime Xyron</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="px-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Connect with us</h3>
              <div className="bg-white dark:bg-[#1c1c1c] rounded-3xl border border-gray-100 dark:border-gray-800 overflow-hidden">
                <a href="https://t.me/prime_xyron" target="_blank" rel="noreferrer" className="flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <Send className="w-5 h-5 text-blue-500" />
                  <span className="font-medium text-gray-700 dark:text-gray-200">Telegram Channel</span>
                </a>
                <a href="https://t.me/+dlXXZly0Tig0MTJl" target="_blank" rel="noreferrer" className="flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors border-t border-gray-50 dark:border-gray-800">
                  <Globe className="w-5 h-5 text-purple-500" />
                  <span className="font-medium text-gray-700 dark:text-gray-200">Chat Group</span>
                </a>
                <div className="flex items-center gap-4 p-4 border-t border-gray-50 dark:border-gray-800">
                  <User className="w-5 h-5 text-gray-400" />
                  <span className="font-medium text-gray-700 dark:text-gray-200">Owner: @zerox6t9</span>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-blue-500 px-2">Frequently Asked Questions</h2>
              <div className="space-y-4">
                {[
                  { q: "How to get a bot token?", a: "Message @BotFather on Telegram and use the /newbot command to create a bot and get your token." },
                  { q: "Can I send media?", a: "Yes, you can send photos, videos, and documents using the attachment icon in the chat." },
                  { q: "How to block a user?", a: "Open a chat, click the menu (three dots) in the top right, and select 'Block User'." }
                ].map((faq, i) => (
                  <div key={i} className="bg-white dark:bg-[#1c1c1c] p-5 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
                    <p className="font-bold text-gray-800 dark:text-white mb-2">{faq.q}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{faq.a}</p>
                  </div>
                ))}
              </div>
            </section>
          </motion.div>
        )}

        <div className="pt-8 pb-4 text-center">
          <p className="text-sm text-gray-400 dark:text-gray-600 font-medium">
            Memegram v1.3.0
          </p>
          <p className="text-[10px] text-gray-400 dark:text-gray-600 mt-1 uppercase tracking-widest">
            powered by ꪑꫀꪑꫀ ꪜꪖ꠸ꪗꪖ
          </p>
        </div>
      </div>
    </div>
  );
}
