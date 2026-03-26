import React, { useState, useRef, useEffect } from 'react';
import { 
  ArrowLeft, Send, Paperclip, MoreVertical, Phone, Video, 
  Image as ImageIcon, Film, File as FileIcon, Shield, 
  ShieldOff, User, X, Smile, FolderOpen, ShieldCheck, ShieldAlert,
  Sticker
} from 'lucide-react';
import { Chat, Message } from '../types';
import ChatBubble from '../components/ChatBubble';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

interface ChatScreenProps {
  chat: Chat;
  messages: Message[];
  onBack: () => void;
  onSendMessage: (text: string) => void;
  onSendMedia: (chatId: number, type: 'photo' | 'video' | 'document', file: File, caption?: string) => void;
  onBlockChat: (chatId: number, blocked: boolean) => void;
}

const STICKERS = [
  'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJ6eXJ6eXJ6eXJ6eXJ6eXJ6eXJ6eXJ6eXJ6eXJ6eXJ6eXJ6eXJ6JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1z/3o7TKMGVp6nZpXpXyM/giphy.gif',
  'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJ6eXJ6eXJ6eXJ6eXJ6eXJ6eXJ6eXJ6eXJ6eXJ6eXJ6eXJ6eXJ6JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1z/3o7TKMGVp6nZpXpXyM/giphy.gif', // Placeholder
  'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJ6eXJ6eXJ6eXJ6eXJ6eXJ6eXJ6eXJ6eXJ6eXJ6eXJ6eXJ6eXJ6JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1z/3o7TKMGVp6nZpXpXyM/giphy.gif',
  'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJ6eXJ6eXJ6eXJ6eXJ6eXJ6eXJ6eXJ6eXJ6eXJ6eXJ6eXJ6eXJ6JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1z/3o7TKMGVp6nZpXpXyM/giphy.gif',
];

export default function ChatScreen({ chat, messages, onBack, onSendMessage, onSendMedia, onBlockChat }: ChatScreenProps) {
  const [inputText, setInputText] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [showMediaMenu, setShowMediaMenu] = useState(false);
  const [showStickerPicker, setShowStickerPicker] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [pendingMediaType, setPendingMediaType] = useState<'photo' | 'video' | 'document' | null>(null);
  const [hasPermission, setHasPermission] = useState(() => localStorage.getItem('storage_permission') === 'true');
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim() && !chat.blocked) {
      onSendMessage(inputText.trim());
      setInputText('');
    }
  };

  const handleAttachmentClick = (type: 'photo' | 'video' | 'document') => {
    setPendingMediaType(type);
    if (!hasPermission) {
      setShowPermissionModal(true);
    } else {
      fileInputRef.current?.click();
    }
    setShowMediaMenu(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && pendingMediaType) {
      onSendMedia(chat.id, pendingMediaType, file);
      setPendingMediaType(null);
    }
  };

  const handleSendSticker = async (url: string) => {
    // Stickers are sent as photos for now in this implementation
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const file = new File([blob], 'sticker.gif', { type: 'image/gif' });
      onSendMedia(chat.id, 'photo', file, 'Sticker');
      setShowStickerPicker(false);
    } catch (e) {
      console.error('Failed to send sticker:', e);
    }
  };

  const grantPermission = () => {
    setHasPermission(true);
    localStorage.setItem('storage_permission', 'true');
    setShowPermissionModal(false);
    setTimeout(() => {
      fileInputRef.current?.click();
    }, 100);
  };

  return (
    <div className="flex flex-col h-full bg-[#f0f2f5] dark:bg-[#050505] transition-colors relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-[0.05] dark:opacity-[0.1] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />

      {/* Header */}
      <header className="p-2 flex items-center justify-between glass sticky top-0 z-30 shadow-sm">
        <div className="flex items-center gap-2">
          <button
            onClick={onBack}
            className="p-1.5 hover:bg-black/5 dark:hover:bg-white/5 rounded-xl transition-all active:scale-90"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
          <div className="flex items-center gap-2 cursor-pointer group" onClick={() => setShowProfile(true)}>
            <div className="relative">
              {chat.photoUrl ? (
                <img src={chat.photoUrl} alt={chat.first_name} className="w-10 h-10 rounded-xl object-cover shadow-md ring-1 ring-white/20" referrerPolicy="no-referrer" />
              ) : (
                <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white font-bold shadow-md text-lg">
                  {chat.first_name[0]}
                </div>
              )}
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white dark:border-[#121212] rounded-full" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white leading-tight text-base group-hover:text-primary transition-colors">
                {chat.first_name}
              </h3>
              <p className="text-[9px] text-primary font-bold uppercase tracking-widest opacity-80">
                {chat.blocked ? 'Blocked' : (chat.username ? `@${chat.username}` : 'online')}
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-xl transition-all active:scale-90">
            <Phone className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          </button>
          <button className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-xl transition-all active:scale-90">
            <Video className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          </button>
          <div className="relative">
            <button 
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-xl transition-all active:scale-90"
            >
              <MoreVertical className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            </button>
            <AnimatePresence>
              {showMenu && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  className="absolute right-0 mt-2 w-56 glass rounded-3xl shadow-2xl overflow-hidden z-50 p-2"
                >
                  <button 
                    onClick={() => { onBlockChat(chat.id, !chat.blocked); setShowMenu(false); }}
                    className="w-full flex items-center gap-3 p-4 hover:bg-black/5 dark:hover:bg-white/5 rounded-2xl transition-colors text-left"
                  >
                    {chat.blocked ? <Shield className="w-5 h-5 text-green-500" /> : <ShieldOff className="w-5 h-5 text-red-500" />}
                    <span className={cn("text-sm font-bold", chat.blocked ? "text-green-500" : "text-red-500")}>
                      {chat.blocked ? 'Unblock User' : 'Block User'}
                    </span>
                  </button>
                  <button 
                    onClick={() => { setShowProfile(true); setShowMenu(false); }}
                    className="w-full flex items-center gap-3 p-4 hover:bg-black/5 dark:hover:bg-white/5 rounded-2xl transition-colors text-left"
                  >
                    <User className="w-5 h-5 text-gray-400" />
                    <span className="text-sm font-bold text-gray-700 dark:text-gray-200">View Profile</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      {/* Profile Modal */}
      <AnimatePresence>
        {showProfile && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowProfile(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-xl"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 50 }}
              className="relative w-full max-w-sm bg-white dark:bg-[#121212] rounded-[3rem] overflow-hidden shadow-2xl border border-white/10"
            >
              <div className="relative h-80">
                {chat.photoUrl ? (
                  <img src={chat.photoUrl} alt={chat.first_name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-full h-full bg-primary flex items-center justify-center text-white text-7xl font-bold">
                    {chat.first_name[0]}
                  </div>
                )}
                <button 
                  onClick={() => setShowProfile(false)}
                  className="absolute top-6 right-6 p-3 bg-black/20 hover:bg-black/40 text-white rounded-full backdrop-blur-md transition-all active:scale-90"
                >
                  <X className="w-6 h-6" />
                </button>
                <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/80 via-black/40 to-transparent text-white">
                  <h2 className="text-3xl font-black">{chat.first_name}</h2>
                  <p className="opacity-80 text-sm font-bold tracking-widest uppercase">online</p>
                </div>
              </div>
              <div className="p-8 space-y-8">
                <div className="space-y-6">
                  <div className="flex items-center gap-5">
                    <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
                      <User className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400 uppercase font-black tracking-[0.2em] mb-1">Username</p>
                      <p className="font-bold text-gray-900 dark:text-white text-lg">@{chat.username || 'not set'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-5">
                    <div className="w-12 h-12 bg-purple-500/10 rounded-2xl flex items-center justify-center">
                      <Shield className="w-6 h-6 text-purple-500" />
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400 uppercase font-black tracking-[0.2em] mb-1">User ID</p>
                      <p className="font-bold text-gray-900 dark:text-white text-lg">{chat.id}</p>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => { onBlockChat(chat.id, !chat.blocked); setShowProfile(false); }}
                  className={cn(
                    "w-full py-5 rounded-[2rem] font-black text-lg transition-all active:scale-95 shadow-xl",
                    chat.blocked ? "bg-green-500 text-white shadow-green-500/20" : "bg-red-500 text-white shadow-red-500/20"
                  )}
                >
                  {chat.blocked ? 'Unblock User' : 'Block User'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Messages Area */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-3 space-y-2 z-0 scroll-smooth"
      >
        {messages.map((msg) => (
          <ChatBubble key={msg.id} message={msg} isOwn={msg.from.id !== chat.id} />
        ))}
      </div>

      {/* Input Area */}
      <div className="p-4 glass border-t border-white/10 z-10">
        <div className="max-w-4xl mx-auto space-y-4">
          <AnimatePresence>
            {showStickerPicker && (
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.95 }}
                className="bg-white dark:bg-[#121212] rounded-[2.5rem] shadow-2xl border border-white/10 p-4 grid grid-cols-4 gap-4 overflow-y-auto max-h-64"
              >
                {STICKERS.map((sticker, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendSticker(sticker)}
                    className="hover:scale-110 transition-transform active:scale-90"
                  >
                    <img src={sticker} alt="Sticker" className="w-full h-auto rounded-xl" />
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSend} className="flex items-center gap-2">
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowMediaMenu(!showMediaMenu)}
                className={cn(
                  "p-3 rounded-xl transition-all active:scale-90",
                  showMediaMenu ? "bg-primary text-white" : "text-gray-400 hover:text-primary hover:bg-primary/10"
                )}
              >
                <Paperclip className="w-5 h-5" />
              </button>
              <AnimatePresence>
                {showMediaMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.9 }}
                    className="absolute bottom-full left-0 mb-4 glass rounded-[2rem] shadow-2xl overflow-hidden p-2 flex flex-col gap-1 min-w-[180px]"
                  >
                    <button onClick={() => handleAttachmentClick('photo')} className="flex items-center gap-4 p-4 hover:bg-black/5 dark:hover:bg-white/5 rounded-2xl transition-colors text-left group">
                      <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
                        <ImageIcon className="w-5 h-5 text-primary group-hover:text-white" />
                      </div>
                      <span className="text-sm font-bold text-gray-700 dark:text-gray-200">Photo</span>
                    </button>
                    <button onClick={() => handleAttachmentClick('video')} className="flex items-center gap-4 p-4 hover:bg-black/5 dark:hover:bg-white/5 rounded-2xl transition-colors text-left group">
                      <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center group-hover:bg-purple-500 group-hover:text-white transition-all">
                        <Film className="w-5 h-5 text-purple-500 group-hover:text-white" />
                      </div>
                      <span className="text-sm font-bold text-gray-700 dark:text-gray-200">Video</span>
                    </button>
                    <button onClick={() => handleAttachmentClick('document')} className="flex items-center gap-4 p-4 hover:bg-black/5 dark:hover:bg-white/5 rounded-2xl transition-colors text-left group">
                      <div className="w-10 h-10 bg-orange-500/10 rounded-xl flex items-center justify-center group-hover:bg-orange-500 group-hover:text-white transition-all">
                        <FileIcon className="w-5 h-5 text-orange-500 group-hover:text-white" />
                      </div>
                      <span className="text-sm font-bold text-gray-700 dark:text-gray-200">Document</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="flex-1 relative flex items-center">
              <button
                type="button"
                onClick={() => setShowStickerPicker(!showStickerPicker)}
                className={cn(
                  "absolute left-3 p-2 rounded-xl transition-all active:scale-90 z-10",
                  showStickerPicker ? "text-primary bg-primary/10" : "text-gray-400 hover:text-primary"
                )}
              >
                <Sticker className="w-6 h-6" />
              </button>
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={chat.blocked ? "User is blocked" : "Message"}
                disabled={chat.blocked}
                className="w-full py-4 pl-14 pr-4 bg-gray-100 dark:bg-white/5 rounded-[1.5rem] text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary/30 transition-all disabled:opacity-50 font-medium"
              />
            </div>

            <button
              type="submit"
              disabled={!inputText.trim() || chat.blocked}
              className="p-4 bg-primary hover:bg-primary-hover disabled:bg-gray-300 dark:disabled:bg-white/10 text-white rounded-2xl shadow-xl shadow-primary/20 transition-all active:scale-90"
            >
              <Send className="w-6 h-6" />
            </button>
          </form>
          <div className="text-center text-[10px] text-gray-400 dark:text-gray-600 font-black uppercase tracking-[0.3em]">
            ꪑꫀꪑꫀ ꪜꪖ꠸ꪗꪖ
          </div>
        </div>
      </div>

      {/* Hidden File Input */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        className="hidden" 
        accept={
          pendingMediaType === 'photo' ? 'image/*' : 
          pendingMediaType === 'video' ? 'video/*' : 
          '*'
        }
      />

      {/* Permission Modal */}
      <AnimatePresence>
        {showPermissionModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-xl"
              onClick={() => setShowPermissionModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 50 }}
              className="relative w-full max-w-sm bg-white dark:bg-[#121212] rounded-[3rem] shadow-2xl overflow-hidden border border-white/10"
            >
              <div className="p-10 text-center">
                <div className="w-24 h-24 bg-primary/10 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8">
                  <FolderOpen className="w-12 h-12 text-primary" />
                </div>
                <h3 className="text-3xl font-black text-gray-900 dark:text-white mb-4">Storage Access</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-10 font-medium">
                  Allow storage access to send photos, videos, and documents.
                </p>
                <div className="space-y-4">
                  <button 
                    onClick={grantPermission}
                    className="w-full py-5 bg-primary hover:bg-primary-hover text-white font-black rounded-[1.5rem] shadow-2xl shadow-primary/25 transition-all active:scale-95 flex items-center justify-center gap-3 text-lg"
                  >
                    <ShieldCheck className="w-6 h-6" />
                    Allow Access
                  </button>
                  <button 
                    onClick={() => setShowPermissionModal(false)}
                    className="w-full py-5 text-gray-500 dark:text-gray-400 font-black hover:bg-gray-100 dark:hover:bg-white/5 rounded-[1.5rem] transition-colors text-lg"
                  >
                    Not Now
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
