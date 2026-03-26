import { useState, useRef } from 'react';
import { format } from 'date-fns';
import { File, Play, Reply, Copy, Trash2, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Message } from '../types';

interface ChatBubbleProps {
  message: Message;
  isOwn: boolean;
  onReply?: (msg: Message) => void;
  onDelete?: (msgId: string) => void;
  onCopy?: (text: string) => void;
  onForward?: (msg: Message) => void;
  onReact?: (msgId: string, emoji: string) => void;
}

const REACTIONS = ['❤️', '😂', '👍', '😮', '😢', '🙏'];
const cn = (...c: (string | boolean | undefined)[]) => c.filter(Boolean).join(' ');

const ChatBubble = ({ message, isOwn, onReply, onDelete, onCopy, onForward, onReact }: ChatBubbleProps) => {
  const [showMenu, setShowMenu] = useState(false);
  const longTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
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

  const handleLongStart = () => { longTimer.current = setTimeout(() => setShowMenu(true), 500); };
  const handleLongEnd = () => { if (longTimer.current) clearTimeout(longTimer.current); };

  const renderContent = () => {
    switch (message.type) {
      case 'photo':
        if (isSticker) return (
          <motion.img src={message.mediaUrl || ''} alt="Sticker"
            initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="w-24 h-24 object-contain" referrerPolicy="no-referrer" />
        );
        return (
          <div className="space-y-1">
            <div className="overflow-hidden rounded-xl">
              <img src={message.mediaUrl || ''} alt="Photo"
                className="max-w-full rounded-xl" referrerPolicy="no-referrer"
                onError={e => { (e.target as HTMLImageElement).src = 'https://placehold.co/200x150?text=Photo'; }} />
            </div>
            {message.caption && <p className="text-xs leading-relaxed">{message.caption}</p>}
          </div>
        );
      case 'video':
        return (
          <a href={message.mediaUrl} target="_blank" rel="noreferrer"
            className="flex items-center gap-3 p-2.5 bg-black/5 dark:bg-white/5 rounded-xl border border-white/10 hover:bg-black/10 transition-all">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <Play className="w-3.5 h-3.5 text-white fill-current" />
            </div>
            <div>
              <p className="text-xs font-bold">Video File</p>
              <p className="text-[9px] opacity-60">Tap to Play</p>
            </div>
          </a>
        );
      case 'audio': case 'voice':
        return (
          <a href={message.mediaUrl} target="_blank" rel="noreferrer"
            className="flex items-center gap-2 p-2.5 bg-black/5 dark:bg-white/5 rounded-xl min-w-[140px]">
            <div className="w-7 h-7 bg-blue-500 rounded-full flex items-center justify-center shrink-0">
              <span className="text-white text-xs">🎵</span>
            </div>
            <div className="flex-1">
              <p className="text-xs font-bold">Audio</p>
              <div className="flex gap-0.5 mt-1">{Array.from({length:10}).map((_,i)=><div key={i} className="w-0.5 bg-current opacity-40 rounded-full" style={{height:Math.random()*10+3}}/>)}</div>
            </div>
          </a>
        );
      case 'document':
        return (
          <a href={message.mediaUrl} target="_blank" rel="noreferrer"
            className="flex items-center gap-2.5 p-2.5 bg-black/5 dark:bg-white/5 rounded-xl">
            <div className="w-8 h-8 bg-gray-500 rounded-xl flex items-center justify-center shrink-0">
              <File className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold truncate">Document</p>
              <p className="text-[9px] opacity-60">Tap to open</p>
            </div>
          </a>
        );
      default:
        return <p className="text-sm leading-relaxed">{message.content}</p>;
    }
  };

  const menuItems = [
    { icon: <Reply className="w-3.5 h-3.5"/>, label: 'Reply', action: () => { onReply?.(message); setShowMenu(false); }, color: 'text-blue-500' },
    ...(message.type === 'text' ? [{ icon: <Copy className="w-3.5 h-3.5"/>, label: 'Copy', action: () => { onCopy?.(message.content); setShowMenu(false); }, color: 'text-gray-600 dark:text-gray-300' }] : []),
    { icon: <ChevronRight className="w-3.5 h-3.5"/>, label: 'Forward', action: () => { onForward?.(message); setShowMenu(false); }, color: 'text-green-500' },
    ...(isOwn ? [{ icon: <Trash2 className="w-3.5 h-3.5"/>, label: 'Delete', action: () => { onDelete?.(message.id); setShowMenu(false); }, color: 'text-red-500' }] : []),
  ];

  return (
    <>
      <AnimatePresence>
        {showMenu && (
          <div className="fixed inset-0 z-50 flex items-end justify-center pb-4 px-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowMenu(false)} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }}
              className="relative w-full max-w-sm bg-white dark:bg-[#1e1e1e] rounded-2xl shadow-2xl overflow-hidden z-10">
              <div className="flex items-center justify-around px-3 py-2.5 border-b border-gray-100 dark:border-gray-800">
                {REACTIONS.map(emoji => (
                  <button key={emoji} onClick={() => { onReact?.(message.id, emoji); setShowMenu(false); }}
                    className="text-xl hover:scale-125 active:scale-90 transition-transform p-1">{emoji}</button>
                ))}
              </div>
              {menuItems.map((item, i) => (
                <button key={i} onClick={item.action}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors border-b border-gray-50 dark:border-gray-800/40 last:border-0">
                  <span className={item.color}>{item.icon}</span>
                  <span className={`text-sm font-medium ${item.color}`}>{item.label}</span>
                </button>
              ))}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className={cn('flex w-full mb-0.5', isOwn ? 'justify-end' : 'justify-start')}>
        <div
          onTouchStart={handleLongStart} onTouchEnd={handleLongEnd}
          onMouseDown={handleLongStart} onMouseUp={handleLongEnd}
          onContextMenu={e => { e.preventDefault(); setShowMenu(true); }}
          className={cn(
            'max-w-[78%] relative select-none cursor-pointer',
            !isSticker && (isOwn
              ? 'bg-blue-500 text-white rounded-2xl rounded-tr-sm px-3 py-2 shadow-sm'
              : 'bg-white dark:bg-[#1e1e1e] text-gray-900 dark:text-gray-100 rounded-2xl rounded-tl-sm px-3 py-2 shadow-sm border border-gray-100 dark:border-gray-800')
          )}>
          {message.replyTo && (
            <div className={cn('mb-1.5 px-2 py-1 rounded-lg border-l-2 text-xs', isOwn ? 'bg-white/10 border-white/40' : 'bg-gray-50 dark:bg-gray-800 border-blue-500')}>
              <p className="font-bold opacity-80 truncate text-[10px]">{message.replyTo.senderName}</p>
              <p className="opacity-70 truncate">{message.replyTo.text}</p>
            </div>
          )}
          {renderContent()}
          {!isSticker && (
            <div className={cn('flex items-center justify-end gap-1 mt-0.5', isOwn ? 'text-white/60' : 'text-gray-400')}>
              <span className="text-[9px]">{format(message.timestamp, 'HH:mm')}</span>
              {isOwn && <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24"><path d="M18 7l-1.41-1.41-6.34 6.34 1.41 1.41L18 7zm4.24-1.41L11.66 16.17 7.48 12l-1.41 1.41L11.66 19l12-12-1.42-1.41zM.41 13.41L6 19l1.41-1.41L1.83 12 .41 13.41z"/></svg>}
            </div>
          )}
          {message.reactions && message.reactions.length > 0 && (
            <div className="flex gap-0.5 mt-1 flex-wrap">
              {message.reactions.map((r, i) => (
                <span key={i} className="text-sm bg-white/20 dark:bg-white/10 rounded-full px-1 py-0.5">{r}</span>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ChatBubble;
