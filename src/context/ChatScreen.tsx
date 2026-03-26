import { useState, useRef, useEffect, useCallback } from 'react';
import { ArrowLeft, Send, Paperclip, MoreVertical, Image as ImageIcon, Film, File as FileIcon, Shield, ShieldOff, X, Search, ChevronDown, BellOff, Bell, Trash2, Smile } from 'lucide-react';
import { Chat, Message, ReplyTo } from '../types';
import ChatBubble from './ChatBubble';
import { motion, AnimatePresence } from 'motion/react';

interface ChatScreenProps {
  chat: Chat;
  messages: Message[];
  onBack: () => void;
  onSendMessage: (text: string, replyTo?: ReplyTo) => void;
  onSendMedia: (chatId: number, type: 'photo' | 'video' | 'document', file: File) => void;
  onBlockChat: (chatId: number, blocked: boolean) => void;
  onDeleteMessage?: (chatId: number, msgId: string) => void;
  onForwardMessage?: (msg: Message) => void;
  onMuteChat?: (chatId: number, muted: boolean) => void;
  onClearChat?: (chatId: number) => void;
  onReactMessage?: (msgId: string, emoji: string) => void;
}

const EMOJIS = ['😀','😂','🥰','😍','🤩','😎','🥳','🤔','😅','😭','😡','🙏','👍','👎','❤️','🔥','💯','🎉','✅','⚡','🎯','💬','🚀','⭐','💎','🌟','🍕','☕','🎵','😊'];

const cn = (...c: (string | boolean | undefined)[]) => c.filter(Boolean).join(' ');
const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

export default function ChatScreen({ chat, messages, onBack, onSendMessage, onSendMedia, onBlockChat, onDeleteMessage, onForwardMessage, onMuteChat, onClearChat, onReactMessage }: ChatScreenProps) {
  const [inputText, setInputText] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [showMediaMenu, setShowMediaMenu] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [replyTo, setReplyTo] = useState<ReplyTo | null>(null);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const [forwardMsg, setForwardMsg] = useState<Message | null>(null);
  const [fileType, setFileType] = useState<'photo'|'video'|'document'>('photo');
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const filtered = searchQuery
    ? messages.filter(m => m.content.toLowerCase().includes(searchQuery.toLowerCase()))
    : messages;

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const h = () => setShowScrollBtn(el.scrollHeight - el.scrollTop - el.clientHeight > 100);
    el.addEventListener('scroll', h);
    return () => el.removeEventListener('scroll', h);
  }, []);

  const scrollToBottom = useCallback(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, []);

  useEffect(() => { scrollToBottom(); }, [messages.length]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    const text = inputText.trim();
    if (!text || chat.blocked) return;
    onSendMessage(text, replyTo || undefined);
    setInputText('');
    setReplyTo(null);
    setShowEmoji(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onSendMedia(chat.id, fileType, file);
    e.target.value = '';
  };

  const pickFile = (type: 'photo'|'video'|'document') => {
    setFileType(type);
    setShowMediaMenu(false);
    setTimeout(() => fileInputRef.current?.click(), 100);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(e as unknown as React.FormEvent);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#efeae2] dark:bg-[#0d0d0d] relative">
      {/* Subtle bg pattern */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{backgroundImage:'radial-gradient(circle,#000 1px,transparent 1px)',backgroundSize:'20px 20px'}} />

      {/* ── HEADER ── */}
      <header className="relative z-10 px-2 py-1.5 bg-white dark:bg-[#1a1a1a] border-b border-gray-100 dark:border-gray-800 shadow-sm">
        <div className="flex items-center gap-2">
          <button onClick={onBack}
            className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full shrink-0 active:scale-90 transition-all">
            <ArrowLeft className="w-4.5 h-4.5 text-gray-700 dark:text-gray-300" />
          </button>

          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-blue-500 flex items-center justify-center shrink-0">
              {chat.photoUrl
                ? <img src={chat.photoUrl} alt={chat.first_name} referrerPolicy="no-referrer" className="w-8 h-8 rounded-xl object-cover" />
                : <span className="text-white text-sm font-bold">{chat.first_name[0]}</span>
              }
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-900 dark:text-white truncate leading-tight">{chat.first_name}</p>
              {chat.username && <p className="text-[10px] text-gray-400 truncate">@{chat.username}</p>}
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button onClick={() => { setShowSearch(s => !s); setShowMenu(false); }}
              className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
              <Search className="w-3.5 h-3.5 text-gray-500" />
            </button>
            <button onClick={() => setShowMenu(m => !m)}
              className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
              <MoreVertical className="w-3.5 h-3.5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Dropdown menu */}
        <AnimatePresence>
          {showMenu && (
            <>
              <div className="fixed inset-0 z-20" onClick={() => setShowMenu(false)} />
              <motion.div initial={{ opacity: 0, y: -4, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -4, scale: 0.95 }}
                className="absolute right-2 top-12 bg-white dark:bg-[#1e1e1e] rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 z-30 overflow-hidden w-44">
                {[
                  { icon: chat.muted ? <Bell className="w-3.5 h-3.5"/> : <BellOff className="w-3.5 h-3.5"/>, label: chat.muted ? 'Unmute' : 'Mute', action: () => { onMuteChat?.(chat.id, !chat.muted); setShowMenu(false); } },
                  { icon: chat.blocked ? <ShieldOff className="w-3.5 h-3.5"/> : <Shield className="w-3.5 h-3.5"/>, label: chat.blocked ? 'Unblock' : 'Block', action: () => { onBlockChat(chat.id, !chat.blocked); setShowMenu(false); }, danger: !chat.blocked },
                  { icon: <Trash2 className="w-3.5 h-3.5"/>, label: 'Clear Chat', action: () => { onClearChat?.(chat.id); setShowMenu(false); }, danger: true },
                ].map((item, i) => (
                  <button key={i} onClick={item.action}
                    className={cn('w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs font-medium transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 border-b border-gray-50 dark:border-gray-800/40 last:border-0',
                      item.danger ? 'text-red-500' : 'text-gray-700 dark:text-gray-300')}>
                    {item.icon} {item.label}
                  </button>
                ))}
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Search bar */}
        <AnimatePresence>
          {showSearch && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }} className="overflow-hidden mt-1.5">
              <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-xl px-3 py-1.5 gap-2">
                <Search className="w-3 h-3 text-gray-400" />
                <input autoFocus value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search messages..." className="flex-1 bg-transparent text-xs outline-none dark:text-white" />
                {searchQuery && <button onClick={() => setSearchQuery('')}><X className="w-3 h-3 text-gray-400" /></button>}
              </div>
              {searchQuery && <p className="text-[10px] text-gray-400 mt-1 px-1">{filtered.length} result{filtered.length !== 1 ? 's' : ''}</p>}
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* ── MESSAGES ── */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-2 space-y-0.5 z-0">
        {filtered.length === 0 && searchQuery ? (
          <div className="flex items-center justify-center h-full text-gray-400 text-sm">
            No messages found for "{searchQuery}"
          </div>
        ) : (
          filtered.map(msg => (
            <ChatBubble key={msg.id} message={msg} isOwn={msg.from.id !== chat.id}
              onReply={m => { setReplyTo({ id: m.id, text: m.type === 'text' ? m.content : `[${m.type}]`, senderName: m.from.first_name }); inputRef.current?.focus(); }}
              onDelete={id => onDeleteMessage?.(chat.id, id)}
              onCopy={text => navigator.clipboard.writeText(text).catch(() => {})}
              onForward={m => setForwardMsg(m)}
              onReact={onReactMessage}
            />
          ))
        )}
      </div>

      {/* Scroll FAB */}
      <AnimatePresence>
        {showScrollBtn && (
          <motion.button initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
            onClick={scrollToBottom}
            className="absolute bottom-20 right-4 z-20 w-9 h-9 bg-white dark:bg-[#1e1e1e] rounded-full shadow-lg flex items-center justify-center border border-gray-100 dark:border-gray-700">
            <ChevronDown className="w-4 h-4 text-gray-500" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Blocked banner */}
      {chat.blocked && (
        <div className="mx-3 mb-2 p-2 bg-red-50 dark:bg-red-500/10 rounded-xl flex items-center gap-2">
          <Shield className="w-3.5 h-3.5 text-red-500 shrink-0" />
          <p className="text-xs text-red-600 dark:text-red-400 font-medium">User blocked. Unblock to send messages.</p>
        </div>
      )}

      {/* ── INPUT AREA ── */}
      <div className="px-2 pb-3 pt-1 bg-white dark:bg-[#1a1a1a] border-t border-gray-100 dark:border-gray-800 z-10">
        <AnimatePresence>
          {replyTo && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
              className="flex items-center gap-2 px-3 py-1.5 mb-1.5 bg-gray-50 dark:bg-gray-800 rounded-xl border-l-2 border-blue-500 overflow-hidden">
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-bold text-blue-500">{replyTo.senderName}</p>
                <p className="text-xs text-gray-500 truncate">{replyTo.text}</p>
              </div>
              <button onClick={() => setReplyTo(null)} className="w-5 h-5 flex items-center justify-center rounded-full">
                <X className="w-3 h-3 text-gray-400" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showEmoji && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
              className="grid grid-cols-8 gap-1 p-2 mb-1.5 bg-gray-50 dark:bg-gray-800 rounded-xl overflow-hidden">
              {EMOJIS.map(e => (
                <button key={e} onClick={() => setInputText(t => t + e)}
                  className="w-7 h-7 flex items-center justify-center text-lg hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg active:scale-90 transition-all">{e}</button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSend} className="flex items-end gap-1.5">
          {/* Emoji */}
          <button type="button" onClick={() => setShowEmoji(s => !s)}
            className={cn('w-8 h-8 flex items-center justify-center rounded-full shrink-0 transition-colors', showEmoji ? 'bg-blue-500 text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400')}>
            <Smile className="w-4 h-4" />
          </button>

          {/* Attachment */}
          <div className="relative">
            <button type="button" onClick={() => setShowMediaMenu(m => !m)}
              className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full text-gray-400 shrink-0">
              <Paperclip className="w-4 h-4" />
            </button>
            <AnimatePresence>
              {showMediaMenu && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowMediaMenu(false)} />
                  <motion.div initial={{ opacity: 0, y: 8, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    className="absolute bottom-10 left-0 bg-white dark:bg-[#1e1e1e] rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden z-20 w-36">
                    {[
                      { icon: <ImageIcon className="w-3.5 h-3.5 text-blue-500"/>, label: 'Photo', type: 'photo' as const },
                      { icon: <Film className="w-3.5 h-3.5 text-purple-500"/>, label: 'Video', type: 'video' as const },
                      { icon: <FileIcon className="w-3.5 h-3.5 text-orange-500"/>, label: 'Document', type: 'document' as const },
                    ].map(item => (
                      <button key={item.type} onClick={() => pickFile(item.type)}
                        className="w-full flex items-center gap-2.5 px-3.5 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800 text-xs font-medium text-gray-700 dark:text-gray-300 border-b border-gray-50 dark:border-gray-800/40 last:border-0">
                        {item.icon} {item.label}
                      </button>
                    ))}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileChange}
            accept={fileType === 'photo' ? 'image/*' : fileType === 'video' ? 'video/*' : '*/*'} />

          {/* Text input */}
          <textarea ref={inputRef} value={inputText} onChange={e => setInputText(e.target.value)}
            onKeyDown={handleKeyDown} placeholder="Message..." rows={1}
            disabled={chat.blocked}
            className="flex-1 px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-2xl text-sm text-gray-900 dark:text-white placeholder-gray-400 outline-none resize-none max-h-24 leading-relaxed disabled:opacity-50"
            style={{ minHeight: '36px' }} />

          {/* Send */}
          <button type="submit" disabled={!inputText.trim() || chat.blocked}
            className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center shrink-0 transition-all active:scale-90 disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-blue-500/30">
            <Send className="w-3.5 h-3.5 text-white" />
          </button>
        </form>
      </div>

      {/* Forward modal */}
      <AnimatePresence>
        {forwardMsg && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setForwardMsg(null)} className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-white dark:bg-[#1e1e1e] rounded-2xl p-5 shadow-2xl w-full max-w-xs">
              <h3 className="font-bold text-gray-900 dark:text-white mb-2 text-sm">Forward Message</h3>
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl mb-3">
                <p className="text-xs text-gray-600 dark:text-gray-300 truncate">{forwardMsg.content}</p>
              </div>
              <button onClick={() => { onForwardMessage?.(forwardMsg); setForwardMsg(null); }}
                className="w-full py-2.5 bg-blue-500 text-white rounded-xl font-bold text-sm active:scale-95 transition-all">
                Forward
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
