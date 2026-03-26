import React from 'react';
import { format } from 'date-fns';
import { File, Play } from 'lucide-react';
import { motion } from 'motion/react';
import { Message } from '../types';
import { cn } from '../lib/utils';

interface ChatBubbleProps {
  message: Message;
  isOwn: boolean;
}

const ChatBubble: React.FC<ChatBubbleProps> = ({ message, isOwn }) => {
  const isSticker = message.type === 'photo' && message.caption === 'Sticker';

  const renderContent = () => {
    switch (message.type) {
      case 'photo':
        if (isSticker) {
          return (
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="relative group cursor-pointer"
            >
              <img
                src={message.mediaUrl || `https://api.telegram.org/file/bot${localStorage.getItem('botToken')}/${message.content}`}
                alt="Sticker"
                className="w-48 h-48 object-contain drop-shadow-2xl hover:scale-110 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
            </motion.div>
          );
        }
        return (
          <div className="space-y-1">
            <div className="relative group cursor-pointer overflow-hidden rounded-2xl">
              <img
                src={message.mediaUrl || `https://api.telegram.org/file/bot${localStorage.getItem('botToken')}/${message.content}`}
                alt="Photo"
                className="max-w-full rounded-2xl shadow-sm group-hover:scale-105 transition-transform duration-500"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300?text=Photo+Expired';
                }}
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
            </div>
            {message.caption && <p className="text-sm mt-2 font-medium leading-relaxed">{message.caption}</p>}
          </div>
        );
      case 'video':
        return (
          <div className="space-y-2">
            <a 
              href={message.mediaUrl} 
              target="_blank" 
              rel="noreferrer"
              className="flex items-center gap-4 p-4 bg-black/5 dark:bg-white/5 rounded-2xl border border-white/10 hover:bg-black/10 dark:hover:bg-white/10 transition-all active:scale-[0.98]"
            >
              <div className="w-14 h-14 bg-primary rounded-full flex items-center justify-center shadow-xl shadow-primary/20">
                <Play className="w-7 h-7 text-white fill-current" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-black truncate">Video File</p>
                <p className="text-[10px] opacity-60 font-bold uppercase tracking-widest">Tap to Play</p>
              </div>
            </a>
            {message.caption && <p className="text-sm mt-2 font-medium leading-relaxed">{message.caption}</p>}
          </div>
        );
      case 'document':
        return (
          <div className="space-y-2">
            <a 
              href={message.mediaUrl} 
              target="_blank" 
              rel="noreferrer"
              className="flex items-center gap-4 p-4 bg-black/5 dark:bg-white/5 rounded-2xl border border-white/10 hover:bg-black/10 dark:hover:bg-white/10 transition-all active:scale-[0.98]"
            >
              <div className="w-14 h-14 bg-gray-200 dark:bg-gray-800 rounded-2xl flex items-center justify-center shadow-inner">
                <File className="w-7 h-7 text-gray-500 dark:text-gray-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-black truncate">Document</p>
                <p className="text-[10px] opacity-60 font-bold uppercase tracking-widest">Tap to Download</p>
              </div>
            </a>
            {message.caption && <p className="text-sm mt-2 font-medium leading-relaxed">{message.caption}</p>}
          </div>
        );
      default:
        return <p className="text-[15px] leading-relaxed whitespace-pre-wrap font-medium">{message.content}</p>;
    }
  };

  return (
    <div className={cn("flex w-full mb-1", isOwn ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[85%] sm:max-w-[70%] relative transition-all duration-300",
          !isSticker && (
            isOwn
              ? "bg-primary text-white rounded-[2rem] rounded-tr-none px-5 py-4 shadow-xl shadow-primary/10"
              : "bg-white dark:bg-[#121212] text-gray-900 dark:text-gray-100 rounded-[2rem] rounded-tl-none px-5 py-4 shadow-xl shadow-black/5 border border-white/10"
          )
        )}
      >
        {renderContent()}
        {!isSticker && (
          <div className={cn("flex items-center justify-end gap-1.5 mt-2", isOwn ? "text-white/70" : "text-gray-400")}>
            <span className="text-[10px] font-black tracking-tighter">
              {format(message.timestamp, 'HH:mm')}
            </span>
            {isOwn && (
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
              </svg>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatBubble;
