import React, { useState, useRef } from 'react';
  import { format } from 'date-fns';
  import { File, Play, Reply, Copy, Trash2, ChevronRight } from 'lucide-react';
  import { motion, AnimatePresence } from 'motion/react';
  import { Message } from '../types';
  import { cn } from '../lib/utils';

  interface ChatBubbleProps {
    message: Message;
    isOwn: boolean;
    onReply?: (msg: Message) => void;
    onDelete?: (msgId: string) => void;
    onCopy?: (text: string) => void;
    onForward?: (msg: Message) => void;
  }

  const REACTIONS = ['❤️', '😂', '👍', '😮', '😢', '🙏'];

  const ChatBubble: React.FC<ChatBubbleProps> = ({ message, isOwn, onReply, onDelete, onCopy, onForward }) => {
    const [showMenu, setShowMenu] = useState(false);
    const [showReactions, setShowReactions] = useState(false);
    const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const isSticker = message.type === 'photo' && message.caption === 'Sticker';
    if (message.deleted) {
      return (
        <div className={cn('flex w-full mb-0.5', isOwn ? 'justify-end' : 'justify-start')}>
          <div className="px-3 py-1.5 rounded-2xl bg-gray-100 dark:bg-gray-800 text-gray-400 text-xs italic">
            🚫 This message was deleted
          </div>
        </div>
      );
    }

    const handleLongPressStart = () => {
      longPressTimer.current = setTimeout(() => { setShowMenu(true); }, 500);
    };
    const handleLongPressEnd = () => {
      if (longPressTimer.current) clearTimeout(longPressTimer.current);
    };

    const renderContent = () => {
      switch (message.type) {
        case 'photo':
          if (isSticker) return (
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
              <img src={message.mediaUrl || ''} alt="Sticker" className="w-28 h-28 object-contain" referrerPolicy="no-referrer" />
            </motion.div>
          );
          return (
            <div className="space-y-1">
              <div className="overflow-hidden rounded-xl cursor-pointer">
                <img src={message.mediaUrl || ''} alt="Photo" className="max-w-full rounded-xl hover:scale-105 transition-transform duration-300"
                  referrerPolicy="no-referrer" onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/200?text=Photo'; }} />
              </div>
              {message.caption && <p className="text-xs leading-relaxed">{message.caption}</p>}
            </div>
          );
        case 'video':
          return (
            <a href={message.mediaUrl} target="_blank" rel="noreferrer"
              className="flex items-center gap-3 p-2.5 bg-black/5 dark:bg-white/5 rounded-xl border border-white/10 hover:bg-black/10 transition-all active:scale-[0.98]">
              <div className="w-9 h-9 bg-primary rounded-full flex items-center justify-center shadow-md">
                <Play className="w-4 h-4 text-white fill-current" />
              </div>
              <div>
                <p className="text-xs font-bold">Video File</p>
                <p className="text-[9px] opacity-60 uppercase">Tap to Play</p>
              </div>
            </a>
          );
        case 'audio': case 'voice':
          return (
            <a href={message.mediaUrl} target="_blank" rel="noreferrer"
              className="flex items-center gap-2.5 p-2.5 bg-black/5 dark:bg-white/5 rounded-xl">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <span className="text-white text-xs">🎵</span>
              </div>
              <div className="flex-1">
                <p className="text-xs font-bold">Audio</p>
                <div className="flex gap-0.5 mt-1">{Array.from({length:12}).map((_,i) => <div key={i} className="w-0.5 bg-current opacity-40 rounded-full" style={{height: Math.random()*12+4}} />)}</div>
              </div>
            </a>
          );
        case 'document':
          return (
            <a href={message.mediaUrl} target="_blank" rel="noreferrer"
              className="flex items-center gap-3 p-2.5 bg-black/5 dark:bg-white/5 rounded-xl border border-white/10 hover:bg-black/10 transition-all active:scale-[0.98]">
              <div className="w-9 h-9 bg-gray-200 dark:bg-gray-700 rounded-xl flex items-center justify-center">
                <File className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              </div>
              <div>
                <p className="text-xs font-bold truncate max-w-[140px]">Document</p>
                <p className="text-[9px] opacity-60 uppercase">Tap to Download</p>
              </div>
            </a>
          );
        default:
          return <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>;
      }
    };

    return (
      <>
        <AnimatePresence>
          {showMenu && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowMenu(false)} className="fixed inset-0 z-50 flex items-end justify-center pb-8 px-4 bg-black/30 backdrop-blur-sm">
              <motion.div initial={{ y: 40, opacity: 0, scale: 0.95 }} animate={{ y: 0, opacity: 1, scale: 1 }} exit={{ y: 40, opacity: 0 }}
                onClick={e => e.stopPropagation()}
                className="w-full max-w-sm bg-white dark:bg-[#1e1e1e] rounded-2xl shadow-2xl overflow-hidden">
                <div className="flex justify-around p-3 border-b border-gray-100 dark:border-gray-800">
                  {REACTIONS.map(emoji => (
                    <button key={emoji} onClick={() => setShowMenu(false)} className="text-2xl hover:scale-125 active:scale-90 transition-transform">{emoji}</button>
                  ))}
                </div>
                {[
                  { icon: <Reply className="w-4 h-4"/>, label: 'Reply', action: () => { onReply?.(message); setShowMenu(false); }, color: 'text-blue-500' },
                  { icon: <Copy className="w-4 h-4"/>, label: 'Copy Text', action: () => { onCopy?.(message.content); setShowMenu(false); }, color: 'text-gray-600 dark:text-gray-300', show: message.type === 'text' },
                  { icon: <ChevronRight className="w-4 h-4"/>, label: 'Forward', action: () => { onForward?.(message); setShowMenu(false); }, color: 'text-green-500' },
                  { icon: <Trash2 className="w-4 h-4"/>, label: 'Delete', action: () => { onDelete?.(message.id); setShowMenu(false); }, color: 'text-red-500', show: isOwn },
                ].filter(item => item.show !== false).map((item, i) => (
                  <button key={i} onClick={item.action}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors border-b border-gray-50 dark:border-gray-800/50 last:border-0">
                    <span className={item.color}>{item.icon}</span>
                    <span className={`text-sm font-medium ${item.color}`}>{item.label}</span>
                  </button>
                ))}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className={cn('flex w-full mb-0.5', isOwn ? 'justify-end' : 'justify-start')}>
          <div
            onTouchStart={handleLongPressStart} onTouchEnd={handleLongPressEnd}
            onMouseDown={handleLongPressStart} onMouseUp={handleLongPressEnd}
            onContextMenu={e => { e.preventDefault(); setShowMenu(true); }}
            className={cn('max-w-[80%] sm:max-w-[65%] relative select-none cursor-pointer',
              !isSticker && (isOwn
                ? 'bg-primary text-white rounded-2xl rounded-tr-sm px-3.5 py-2 shadow-md shadow-primary/10'
                : 'bg-white dark:bg-[#1e1e1e] text-gray-900 dark:text-gray-100 rounded-2xl rounded-tl-sm px-3.5 py-2 shadow-sm border border-gray-100 dark:border-gray-800'))}>
            {message.replyTo && (
              <div className={cn('mb-1.5 px-2 py-1 rounded-lg border-l-2 text-xs', isOwn ? 'bg-white/10 border-white/40' : 'bg-gray-50 dark:bg-gray-800 border-primary')}>
                <p className="font-bold opacity-80 truncate text-[10px]">{message.replyTo.senderName}</p>
                <p className="opacity-70 truncate">{message.replyTo.text}</p>
              </div>
            )}
            {renderContent()}
            {!isSticker && (
              <div className={cn('flex items-center justify-end gap-1 mt-1', isOwn ? 'text-white/60' : 'text-gray-400')}>
                <span className="text-[10px]">{format(message.timestamp, 'HH:mm')}</span>
                {isOwn && <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24"><path d="M18 7l-1.41-1.41-6.34 6.34 1.41 1.41L18 7zm4.24-1.41L11.66 16.17 7.48 12l-1.41 1.41L11.66 19l12-12-1.42-1.41zM.41 13.41L6 19l1.41-1.41L1.83 12 .41 13.41z"/></svg>}
              </div>
            )}
          </div>
        </div>
      </>
    );
  };

  export default ChatBubble;
  