import { useState, useEffect, useCallback } from 'react';
  import { motion, AnimatePresence } from 'motion/react';
  import { Chat, Message, BotInfo, ReplyTo } from './types';
  import Splash from './components/Splash';
  import Login from './components/Login';
  import ChatList from './components/ChatList';
  import ChatScreen from './context/ChatScreen';
  import Sidebar from './components/Sidebar';
  import SettingsView from './components/Settings';
  import AboutView from './components/AboutView';
  import BroadcastScreen from './components/BroadcastScreen';
  import ConfirmModal from './context/ConfirmModal';
  import { Megaphone } from 'lucide-react';

  const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

  export default function App() {
    const [isSplashFinished, setIsSplashFinished] = useState(false);
    const [bots, setBots] = useState<BotInfo[]>(() => JSON.parse(localStorage.getItem('bots') || '[]'));
    const [activeBotToken, setActiveBotToken] = useState<string | null>(() => localStorage.getItem('activeBotToken'));
    const [chats, setChats] = useState<Chat[]>(() => JSON.parse(localStorage.getItem('chats') || '[]'));
    const [messages, setMessages] = useState<Message[]>(() => JSON.parse(localStorage.getItem('messages') || '[]'));
    const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [currentView, setCurrentView] = useState<'chats' | 'settings' | 'about' | 'help' | 'add_bot' | 'broadcast'>('chats');
    const [searchQuery, setSearchQuery] = useState('');
    const [primaryColor, setPrimaryColor] = useState(() => localStorage.getItem('primaryColor') || '#3b82f6');
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const [showClearConfirm, setShowClearConfirm] = useState(false);
    const [clearChatId, setClearChatId] = useState<number | null>(null);

    // Persistence
    useEffect(() => { localStorage.setItem('bots', JSON.stringify(bots)); }, [bots]);
    useEffect(() => { if (activeBotToken) localStorage.setItem('activeBotToken', activeBotToken); else localStorage.removeItem('activeBotToken'); }, [activeBotToken]);
    useEffect(() => { localStorage.setItem('chats', JSON.stringify(chats)); }, [chats]);
    useEffect(() => { localStorage.setItem('messages', JSON.stringify(messages)); }, [messages]);
    useEffect(() => {
      localStorage.setItem('primaryColor', primaryColor);
      document.documentElement.style.setProperty('--primary-color', primaryColor);
      const r = parseInt(primaryColor.slice(1,3),16), g = parseInt(primaryColor.slice(3,5),16), b = parseInt(primaryColor.slice(5,7),16);
      document.documentElement.style.setProperty('--primary-color-hover', `rgb(${Math.max(0,r-30)},${Math.max(0,g-30)},${Math.max(0,b-30)})`);
    }, [primaryColor]);

    // Bot Polling
    const fetchUpdates = useCallback(async () => {
      if (!activeBotToken) return;
      try {
        const res = await fetch(`${API_BASE}/api/bot/updates?token=${encodeURIComponent(activeBotToken)}`);
        if (!res.ok) throw new Error('Network error');
        const data = await res.json();
        setChats(prev => {
          let changed = false;
          const next = [...prev];
          data.chats.forEach((c: Chat) => {
            const idx = next.findIndex(nc => nc.id === c.id);
            if (idx === -1) { next.push({ ...c, unreadCount: 0 }); changed = true; }
            else {
              // update lastMessage + photoUrl if changed
              if (JSON.stringify(next[idx].lastMessage) !== JSON.stringify(c.lastMessage)) {
                next[idx] = { ...next[idx], lastMessage: c.lastMessage, photoUrl: c.photoUrl };
                changed = true;
              }
            }
          });
          return changed ? next : prev;
        });
        setMessages(prev => {
          let changed = false;
          const next = [...prev];
          data.messages.forEach((m: Message) => {
            if (!next.find(nm => nm.id === m.id)) { next.push(m); changed = true; }
          });
          if (changed) {
            // increment unread for chats not currently selected
            const newMsgs = data.messages.filter((m: Message) => !prev.find(nm => nm.id === m.id));
            if (newMsgs.length > 0) {
              setChats(prevChats => {
                const updated = [...prevChats];
                newMsgs.forEach((m: Message) => {
                  if (selectedChat?.id !== m.chatId) {
                    const idx = updated.findIndex(c => c.id === m.chatId);
                    if (idx !== -1 && m.from.id === m.chatId) {
                      updated[idx] = { ...updated[idx], unreadCount: (updated[idx].unreadCount || 0) + 1 };
                    }
                  }
                });
                return updated;
              });
            }
          }
          return changed ? next : prev;
        });
      } catch (e) { console.error('Failed to fetch updates:', e); }
    }, [activeBotToken, selectedChat]);

    useEffect(() => {
      if (!activeBotToken) return;
      fetchUpdates();
      const id = setInterval(fetchUpdates, 3000);
      return () => clearInterval(id);
    }, [fetchUpdates, activeBotToken]);

    // ── Actions ───────────────────────────────────────────────────────────────
    const handleLogin = async (botTokenInput: string) => {
      try {
        const res = await fetch(`${API_BASE}/api/bot/init`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: botTokenInput })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to initialize bot');
        const newBot: BotInfo = { token: botTokenInput, id: data.id, first_name: data.first_name, username: data.username, photoUrl: data.photoUrl };
        setBots(prev => { const exists = prev.find(b => b.token === botTokenInput); return exists ? prev : [...prev, newBot]; });
        setActiveBotToken(botTokenInput);
      } catch (e: any) { throw new Error(e.message || 'Login failed'); }
    };

    const handleSelectChat = (chat: Chat) => {
      setSelectedChat(chat);
      setChats(prev => prev.map(c => c.id === chat.id ? { ...c, unreadCount: 0 } : c));
    };

    const handleSendMessage = async (text: string, replyTo?: ReplyTo) => {
      if (!selectedChat || !activeBotToken) return;
      const tempMsg: Message = {
        id: `temp_${Date.now()}`, chatId: selectedChat.id,
        from: { id: -1, first_name: 'Me' }, type: 'text', content: text,
        timestamp: Date.now(), replyTo
      };
      setMessages(prev => [...prev, tempMsg]);
      try {
        const res = await fetch(`${API_BASE}/api/bot/send`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: activeBotToken, chatId: selectedChat.id, text })
        });
        if (!res.ok) throw new Error('Send failed');
      } catch (e) { setMessages(prev => prev.filter(m => m.id !== tempMsg.id)); console.error(e); }
    };

    const handleSendMedia = async (chatId: number, type: 'photo' | 'video' | 'document', file: File, caption?: string) => {
      if (!activeBotToken) return;
      const formData = new FormData();
      formData.append('token', activeBotToken);
      formData.append('chatId', String(chatId));
      formData.append('type', type);
      formData.append('file', file);
      if (caption) formData.append('caption', caption);
      try {
        await fetch(`${API_BASE}/api/bot/sendMedia`, { method: 'POST', body: formData });
      } catch (e) { console.error('Media send failed:', e); }
    };

    const handleBlockChat = async (chatId: number, blocked: boolean) => {
      if (!activeBotToken) return;
      setChats(prev => prev.map(c => c.id === chatId ? { ...c, blocked } : c));
      try {
        await fetch(`${API_BASE}/api/bot/block`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: activeBotToken, chatId, blocked })
        });
      } catch (e) { console.error(e); }
    };

    const handleDeleteMessage = async (chatId: number, msgId: string) => {
      if (!activeBotToken) return;
      setMessages(prev => prev.map(m => m.id === msgId ? { ...m, deleted: true } : m));
      try {
        await fetch(`${API_BASE}/api/bot/deleteMessage`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: activeBotToken, chatId, messageId: msgId })
        });
      } catch (e) { console.error(e); }
    };

    const handleMuteChat = (chatId: number, muted: boolean) => {
      setChats(prev => prev.map(c => c.id === chatId ? { ...c, muted } : c));
    };

    const handleClearChat = (chatId: number) => {
      setClearChatId(chatId);
    };

    const confirmClearChat = () => {
      if (clearChatId === null) return;
      setMessages(prev => prev.filter(m => m.chatId !== clearChatId));
      setChats(prev => prev.map(c => c.id === clearChatId ? { ...c, lastMessage: undefined, unreadCount: 0 } : c));
      setClearChatId(null);
      setSelectedChat(null);
    };

    const handleForwardMessage = async (msg: Message) => {
      // Forward to next chat in list
      const otherChats = chats.filter(c => c.id !== selectedChat?.id && !c.blocked);
      if (otherChats.length === 0 || !activeBotToken) return;
      const target = otherChats[0];
      await fetch(`${API_BASE}/api/bot/send`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: activeBotToken, chatId: target.id, text: `📩 Forwarded:\n${msg.content}` })
      });
    };

    const handleLogout = () => {
      const remaining = bots.filter(b => b.token !== activeBotToken);
      setBots(remaining);
      if (remaining.length > 0) setActiveBotToken(remaining[remaining.length - 1].token);
      else { setActiveBotToken(null); setChats([]); setMessages([]); }
      setShowLogoutConfirm(false);
      setSelectedChat(null);
    };

    const handleSwitchBot = (t: string) => { setActiveBotToken(t); setSelectedChat(null); setIsSidebarOpen(false); };

    // ── Derived state ─────────────────────────────────────────────────────────
    const activeBot = bots.find(b => b.token === activeBotToken);
    const filteredChats = chats.filter(c => {
      if (searchQuery) return (c.first_name + (c.username || '')).toLowerCase().includes(searchQuery.toLowerCase());
      return true;
    }).sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return (b.lastMessage?.timestamp || 0) - (a.lastMessage?.timestamp || 0);
    });
    const chatMessages = selectedChat ? messages.filter(m => m.chatId === selectedChat.id) : [];

    // ── Render ────────────────────────────────────────────────────────────────
    if (!isSplashFinished) return <Splash onFinish={() => setIsSplashFinished(true)} />;
    if (!activeBotToken || bots.length === 0) return (
      <Login onLogin={handleLogin} onAddBot={bots.length > 0 ? () => {} : undefined} />
    );

    return (
      <div className="h-screen flex flex-col bg-white dark:bg-[#121212] overflow-hidden" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} onLogout={() => setShowLogoutConfirm(true)}
          onNavigate={(v) => { setCurrentView(v); setSelectedChat(null); setIsSidebarOpen(false); }}
          bots={bots} activeBotToken={activeBotToken} onSwitchBot={handleSwitchBot}
          onAddBot={() => { setCurrentView('add_bot'); setIsSidebarOpen(false); }}
          showAddBot={bots.length < 3} />

        <div className="flex-1 overflow-hidden">
          <AnimatePresence mode="wait">
            {selectedChat ? (
              <motion.div key="chat" className="h-full" initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 30, stiffness: 300 }}>
                <ChatScreen chat={selectedChat} messages={chatMessages} onBack={() => setSelectedChat(null)}
                  onSendMessage={handleSendMessage} onSendMedia={handleSendMedia} onBlockChat={handleBlockChat}
                  onDeleteMessage={handleDeleteMessage} onForwardMessage={handleForwardMessage}
                  onMuteChat={handleMuteChat} onClearChat={handleClearChat} />
              </motion.div>
            ) : currentView === 'settings' ? (
              <motion.div key="settings" className="h-full" initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 30, stiffness: 300 }}>
                <SettingsView onBack={() => setCurrentView('chats')} primaryColor={primaryColor}
                  onColorChange={setPrimaryColor} onClearData={() => setShowClearConfirm(true)} />
              </motion.div>
            ) : currentView === 'about' || currentView === 'help' ? (
              <motion.div key="about" className="h-full" initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 30, stiffness: 300 }}>
                <AboutView onBack={() => setCurrentView('chats')} />
              </motion.div>
            ) : currentView === 'broadcast' ? (
              <motion.div key="broadcast" className="h-full" initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 30, stiffness: 300 }}>
                <BroadcastScreen chats={chats} botToken={activeBotToken} onBack={() => setCurrentView('chats')} />
              </motion.div>
            ) : (
              <motion.div key="chatlist" className="h-full relative" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <ChatList chats={filteredChats} searchQuery={searchQuery} onSearchChange={setSearchQuery}
                  onSelectChat={handleSelectChat} onOpenMenu={() => setIsSidebarOpen(true)} botToken={activeBotToken} />
                {/* Broadcast FAB */}
                <button onClick={() => setCurrentView('broadcast')}
                  className="absolute bottom-16 right-4 w-12 h-12 bg-primary text-white rounded-full shadow-lg shadow-primary/30 flex items-center justify-center hover:scale-105 active:scale-95 transition-all z-10">
                  <Megaphone className="w-5 h-5" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Modals */}
        <ConfirmModal isOpen={showLogoutConfirm} title="Remove Bot" message="Remove this bot from Memegram? You can add it back anytime."
          confirmText="Remove" isDanger onConfirm={handleLogout} onCancel={() => setShowLogoutConfirm(false)} />
        <ConfirmModal isOpen={showClearConfirm} title="Clear All Data" message="This will delete all chats and messages. Cannot be undone."
          confirmText="Clear" isDanger onConfirm={() => { setChats([]); setMessages([]); setShowClearConfirm(false); }} onCancel={() => setShowClearConfirm(false)} />
        <ConfirmModal isOpen={clearChatId !== null} title="Clear Chat" message="Delete all messages in this conversation?"
          confirmText="Clear" isDanger onConfirm={confirmClearChat} onCancel={() => setClearChatId(null)} />
      </div>
    );
  }
  