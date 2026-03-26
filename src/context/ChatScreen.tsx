import React, { useState, useRef, useEffect, useCallback } from 'react';
  import { ArrowLeft, Send, Paperclip, MoreVertical, Image as ImageIcon, Film, File as FileIcon, Shield, ShieldOff, User, X, Search, ChevronDown, BellOff, Bell, Trash2, Copy, Check } from 'lucide-react';
  import { Chat, Message, ReplyTo } from '../types';
  import ChatBubble from '../components/ChatBubble';
  import { motion, AnimatePresence } from 'motion/react';
  import { cn } from '../lib/utils';

  interface ChatScreenProps {
    chat: Chat;
    messages: Message[];
    onBack: () => void;
    onSendMessage: (text: string, replyTo?: ReplyTo) => void;
    onSendMedia: (chatId: number, type: 'photo' | 'video' | 'document', file: File, caption?: string) => void;
    onBlockChat: (chatId: number, blocked: boolean) => void;
    onDeleteMessage?: (chatId: number, msgId: string) => void;
    onForwardMessage?: (msg: Message) => void;
    onMuteChat?: (chatId: number, muted: boolean) => void;
    onClearChat?: (chatId: number) => void;
  }

  const COMMON_EMOJIS = ['😀','😂','🥰','😍','🤩','😎','🥳','🤔','😅','😭','😡','🙏','👍','👎','❤️','🔥','💯','🎉','✅','⚡','🎯','💬','📢','🚀','⭐','💎','🌟','🍕','☕','🎵'];

  export default function ChatScreen({ chat, messages, onBack, onSendMessage, onSendMedia, onBlockChat, onDeleteMessage, onForwardMessage, onMuteChat, onClearChat }: ChatScreenProps) {
    const [inputText, setInputText] = useState('');
    const [showMenu, setShowMenu] = useState(false);
    const [showMediaMenu, setShowMediaMenu] = useState(false);
    const [showProfile, setShowProfile] = useState(false);
    const [showEmoji, setShowEmoji] = useState(false);
    const [showSearch, setShowSearch] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [replyTo, setReplyTo] = useState<ReplyTo | null>(null);
    const [showScrollBtn, setShowScrollBtn] = useState(false);
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [forwardMsg, setForwardMsg] = useState<Message | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [fileType, setFileType] = useState<'photo'|'video'|'document'>('photo');
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

    const filteredMessages = searchQuery
      ? messages.filter(m => m.content.toLowerCase().includes(searchQuery.toLowerCase()))
      : messages;

    useEffect(() => {
      const el = scrollRef.current;
      if (!el) return;
      const handleScroll = () => {
        setShowScrollBtn(el.scrollHeight - el.scrollTop - el.clientHeight > 120);
      };
      el.addEventListener('scroll', handleScroll);
      return () => el.removeEventListener('scroll', handleScroll);
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

    const handleReply = (msg: Message) => {
      setReplyTo({ id: msg.id, text: msg.type === 'text' ? msg.content : `[${msg.type}]`, senderName: msg.from.first_name });
      inputRef.current?.focus();
    };

    const handleCopy = (text: string, id?: string) => {
      navigator.clipboard.writeText(text).catch(() => {});
      if (id) { setCopiedId(id); setTimeout(() => setCopiedId(null), 2000); }
    };

    const handleDelete = (msgId: string) => { onDeleteMessage?.(chat.id, msgId); };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) { onSendMedia(chat.id, fileType, file); }
      e.target.value = '';
    };

    const pickFile = (type: 'photo'|'video'|'document') => {
      setFileType(type);
      setShowMediaMenu(false);
      setTimeout(() => fileInputRef.current?.click(), 100);
    };

    return (
      <div className="flex flex-col h-full bg-[#efeae2] dark:bg-[#0d0d0d] relative overflow-hidden">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)', backgroundSize: '20px 20px'}} />

        {/* ── HEADER ── */}
        <header className="flex items-center justify-between px-2 py-1.5 bg-white dark:bg-[#1a1a1a] border-b border-gray-100 dark:border-gray-800 z-30 shadow-sm">
          <div className="flex items-center gap-1.5">
            <button onClick={onBack} className="w-9 h-9 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full active:scale-90 transition-all">
              <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </button>
            <button className="flex items-center gap-2 py-1 px-1 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors" onClick={() => setShowProfile(true)}>
              {chat.photoUrl
                ? <img src={chat.photoUrl} alt={chat.first_name} className="w-9 h-9 rounded-full object-cover ring-1 ring-gray-200 dark:ring-gray-700" referrerPolicy="no-referrer" />
                : <div className="w-9 h-9 bg-primary rounded-full flex items-center justify-center text-white font-bold">{chat.first_name[0]}</div>}
              <div className="text-left">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white leading-tight">{chat.first_name}</h3>
                <p className="text-[10px] text-green-500 font-medium">{chat.blocked ? '🚫 Blocked' : 'tap to view profile'}</p>
              </div>
            </button>
          </div>

          <div className="flex items-center gap-0.5">
            <button onClick={() => { setShowSearch(!showSearch); setSearchQuery(''); }} className="w-9 h-9 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
              <Search className="w-4 h-4 text-gray-500" />
            </button>
            <div className="relative">
              <button onClick={() => setShowMenu(!showMenu)} className="w-9 h-9 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
                <MoreVertical className="w-4 h-4 text-gray-500" />
              </button>
              <AnimatePresence>
                {showMenu && (
                  <motion.div initial={{ opacity: 0, scale: 0.95, y: -8 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                    className="absolute right-0 top-10 w-52 bg-white dark:bg-[#1e1e1e] rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 z-50 overflow-hidden py-1">
                    {[
                      { icon: chat.blocked ? <Shield className="w-4 h-4 text-green-500"/> : <ShieldOff className="w-4 h-4 text-red-500"/>, label: chat.blocked ? 'Unblock User' : 'Block User', action: () => { onBlockChat(chat.id, !chat.blocked); setShowMenu(false); }, color: chat.blocked ? 'text-green-600' : 'text-red-500' },
                      { icon: <User className="w-4 h-4 text-gray-400"/>, label: 'View Profile', action: () => { setShowProfile(true); setShowMenu(false); }, color: 'text-gray-700 dark:text-gray-200' },
                      { icon: <BellOff className="w-4 h-4 text-gray-400"/>, label: chat.muted ? 'Unmute Chat' : 'Mute Chat', action: () => { onMuteChat?.(chat.id, !chat.muted); setShowMenu(false); }, color: 'text-gray-700 dark:text-gray-200' },
                      { icon: <Trash2 className="w-4 h-4 text-red-400"/>, label: 'Clear Chat', action: () => { onClearChat?.(chat.id); setShowMenu(false); }, color: 'text-red-500' },
                    ].map((item, i) => (
                      <button key={i} onClick={item.action} className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                        {item.icon}<span className={`text-sm font-medium ${item.color}`}>{item.label}</span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Search bar */}
        <AnimatePresence>
          {showSearch && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
              className="bg-white dark:bg-[#1a1a1a] border-b border-gray-100 dark:border-gray-800 overflow-hidden px-3 py-2">
              <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-xl px-3 py-1.5">
                <Search className="w-3.5 h-3.5 text-gray-400" />
                <input autoFocus value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search in conversation..." className="flex-1 bg-transparent text-sm outline-none dark:text-white" />
                {searchQuery && <button onClick={() => setSearchQuery('')}><X className="w-3.5 h-3.5 text-gray-400" /></button>}
              </div>
              {searchQuery && <p className="text-[10px] text-gray-400 mt-1 px-1">{filteredMessages.length} result{filteredMessages.length !== 1 ? 's' : ''}</p>}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── MESSAGES ── */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-2 space-y-1 z-0">
          {filteredMessages.length === 0 && searchQuery ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <p className="text-sm">No messages found for "{searchQuery}"</p>
            </div>
          ) : (
            filteredMessages.map(msg => (
              <ChatBubble key={msg.id} message={msg} isOwn={msg.from.id !== chat.id}
                onReply={handleReply} onDelete={handleDelete}
                onCopy={(text) => handleCopy(text, msg.id)}
                onForward={(m) => { setForwardMsg(m); setShowMenu(false); }} />
            ))
          )}
        </div>

        {/* Scroll to bottom FAB */}
        <AnimatePresence>
          {showScrollBtn && (
            <motion.button initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
              onClick={scrollToBottom}
              className="absolute bottom-20 right-4 z-20 w-10 h-10 bg-white dark:bg-[#1e1e1e] rounded-full shadow-lg flex items-center justify-center border border-gray-100 dark:border-gray-700">
              <ChevronDown className="w-5 h-5 text-gray-500" />
            </motion.button>
          )}
        </AnimatePresence>

        {/* Blocked banner */}
        {chat.blocked && (
          <div className="mx-3 mb-2 p-2.5 bg-red-50 dark:bg-red-500/10 rounded-xl flex items-center gap-2.5">
            <Shield className="w-4 h-4 text-red-500 shrink-0" />
            <p className="text-xs text-red-600 dark:text-red-400 font-medium">This user is blocked. Unblock to send messages.</p>
          </div>
        )}

        {/* ── INPUT AREA ── */}
        <div className="px-2 pb-3 pt-1.5 bg-white dark:bg-[#1a1a1a] border-t border-gray-100 dark:border-gray-800 z-10">
          {/* Reply preview */}
          <AnimatePresence>
            {replyTo && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                className="flex items-center gap-2 px-3 py-1.5 mb-1.5 bg-gray-50 dark:bg-gray-800 rounded-xl border-l-2 border-primary overflow-hidden">
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-bold text-primary">{replyTo.senderName}</p>
                  <p className="text-xs text-gray-500 truncate">{replyTo.text}</p>
                </div>
                <button onClick={() => setReplyTo(null)} className="w-6 h-6 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full">
                  <X className="w-3 h-3 text-gray-400" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Emoji picker */}
          <AnimatePresence>
            {showEmoji && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                className="grid grid-cols-8 gap-1.5 p-2 mb-1.5 bg-gray-50 dark:bg-gray-800 rounded-xl overflow-hidden">
                {COMMON_EMOJIS.map(emoji => (
                  <button key={emoji} onClick={() => setInputText(t => t + emoji)}
                    className="w-8 h-8 flex items-center justify-center text-xl hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg active:scale-90 transition-all">
                    {emoji}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSend} className="flex items-end gap-1.5">
            {/* Attachment */}
            <div className="relative">
              <button type="button" onClick={() => setShowMediaMenu(!showMediaMenu)}
                className="w-9 h-9 flex items-center justify-center text-gray-400 hover:text-primary hover:bg-primary/10 rounded-full transition-all active:scale-90">
                <Paperclip className="w-5 h-5" />
              </button>
              <AnimatePresence>
                {showMediaMenu && (
                  <motion.div initial={{ opacity: 0, y: 10, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10 }}
                    className="absolute bottom-11 left-0 bg-white dark:bg-[#1e1e1e] rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden py-1 w-40">
                    {[
                      { icon: <ImageIcon className="w-4 h-4 text-green-500"/>, label: 'Photo', type: 'photo' as const },
                      { icon: <Film className="w-4 h-4 text-blue-500"/>, label: 'Video', type: 'video' as const },
                      { icon: <FileIcon className="w-4 h-4 text-orange-500"/>, label: 'Document', type: 'document' as const },
                    ].map(item => (
                      <button key={item.type} type="button" onClick={() => pickFile(item.type)}
                        className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                        {item.icon}<span className="text-sm font-medium text-gray-700 dark:text-gray-200">{item.label}</span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Text input */}
            <div className="flex-1 flex items-end bg-gray-100 dark:bg-gray-800 rounded-2xl px-3 py-1.5 gap-1.5">
              <button type="button" onClick={() => setShowEmoji(!showEmoji)} className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-yellow-500 transition-colors">
                <span className="text-lg">{showEmoji ? '⌨️' : '😊'}</span>
              </button>
              <textarea ref={inputRef} value={inputText} onChange={e => setInputText(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(e as any); }}}
                placeholder={chat.blocked ? 'User is blocked...' : 'Message...'}
                disabled={chat.blocked}
                rows={1}
                className="flex-1 bg-transparent text-sm outline-none dark:text-white resize-none max-h-24 leading-5 py-1 placeholder-gray-400 disabled:opacity-50"
                style={{scrollbarWidth: 'none'}} />
            </div>

            {/* Send */}
            <button type="submit" disabled={!inputText.trim() || chat.blocked}
              className={cn('w-9 h-9 flex items-center justify-center rounded-full transition-all active:scale-90',
                inputText.trim() && !chat.blocked ? 'bg-primary text-white shadow-md shadow-primary/30' : 'bg-gray-200 dark:bg-gray-700 text-gray-400')}>
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

        <input ref={fileInputRef} type="file" className="hidden"
          accept={fileType === 'photo' ? 'image/*' : fileType === 'video' ? 'video/*' : '*/*'}
          onChange={handleFileChange} />

        {/* ── PROFILE MODAL ── */}
        <AnimatePresence>
          {showProfile && (
            <div className="fixed inset-0 z-[100] flex items-end justify-center">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setShowProfile(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
              <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                className="relative w-full max-w-lg bg-white dark:bg-[#1a1a1a] rounded-t-3xl overflow-hidden shadow-2xl">
                {/* Profile pic */}
                <div className="relative h-52">
                  {chat.photoUrl
                    ? <img src={chat.photoUrl} alt={chat.first_name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    : <div className="w-full h-full bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center text-white text-6xl font-bold">{chat.first_name[0]}</div>}
                  <button onClick={() => setShowProfile(false)} className="absolute top-4 right-4 w-8 h-8 bg-black/20 text-white rounded-full flex items-center justify-center">
                    <X className="w-4 h-4" />
                  </button>
                  <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black/70 to-transparent text-white">
                    <h2 className="text-xl font-bold">{chat.first_name}</h2>
                    {chat.username && <p className="text-sm opacity-80">@{chat.username}</p>}
                  </div>
                </div>
                {/* Info rows */}
                <div className="p-4 space-y-2">
                  {[
                    { label: 'User ID', value: String(chat.id), icon: '🆔' },
                    { label: 'Username', value: chat.username ? `@${chat.username}` : 'Not set', icon: '👤' },
                    { label: 'Status', value: chat.blocked ? '🚫 Blocked' : '✅ Active', icon: '📊' },
                  ].map(row => (
                    <div key={row.label} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                      <span className="text-xl">{row.icon}</span>
                      <div className="flex-1">
                        <p className="text-[10px] text-gray-400 uppercase font-semibold tracking-wider">{row.label}</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{row.value}</p>
                      </div>
                      <button onClick={() => handleCopy(row.value)} className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-primary">
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                  <button onClick={() => { onBlockChat(chat.id, !chat.blocked); setShowProfile(false); }}
                    className={cn('w-full py-2.5 rounded-xl font-bold text-sm mt-2 transition-all active:scale-95',
                      chat.blocked ? 'bg-green-500 text-white' : 'bg-red-500 text-white')}>
                    {chat.blocked ? '✅ Unblock User' : '🚫 Block User'}
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Forward modal */}
        <AnimatePresence>
          {forwardMsg && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setForwardMsg(null)} className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
              <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
                className="relative bg-white dark:bg-[#1e1e1e] rounded-2xl p-4 shadow-2xl w-full max-w-sm">
                <h3 className="font-bold text-gray-900 dark:text-white mb-2">Forward Message</h3>
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl mb-3">
                  <p className="text-sm text-gray-600 dark:text-gray-300 truncate">{forwardMsg.content}</p>
                </div>
                <button onClick={() => { onForwardMessage?.(forwardMsg); setForwardMsg(null); }}
                  className="w-full py-2.5 bg-primary text-white rounded-xl font-bold text-sm active:scale-95 transition-all">
                  Forward
                </button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    );
  }
  