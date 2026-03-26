import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Chat, Message, BotInfo, ReplyTo } from './types';
import { ThemeProvider } from './context/ThemeContext';
import Splash from './components/Splash';
import Login from './components/Login';
import ChatList from './components/ChatList';
import ChatScreen from './components/ChatScreen';
import Sidebar from './components/Sidebar';
import Settings from './components/Settings';
import AboutView from './components/AboutView';
import BroadcastScreen from './components/BroadcastScreen';
import ConfirmModal from './components/ConfirmModal';
import { Megaphone } from 'lucide-react';

const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

type View = 'chats' | 'settings' | 'about' | 'help' | 'add_bot' | 'broadcast';

export default function App() {
  const [splashDone, setSplashDone] = useState(false);
  const [bots, setBots] = useState<BotInfo[]>(() => JSON.parse(localStorage.getItem('bots') || '[]'));
  const [activeBotToken, setActiveBotToken] = useState<string | null>(() => localStorage.getItem('activeBotToken'));
  const [chats, setChats] = useState<Chat[]>(() => JSON.parse(localStorage.getItem('chats') || '[]'));
  const [messages, setMessages] = useState<Message[]>(() => JSON.parse(localStorage.getItem('messages') || '[]'));
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentView, setCurrentView] = useState<View>('chats');
  const [searchQuery, setSearchQuery] = useState('');
  const [primaryColor, setPrimaryColor] = useState(() => localStorage.getItem('primaryColor') || '#3b82f6');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [clearChatId, setClearChatId] = useState<number | null>(null);

  // Persistence
  useEffect(() => { localStorage.setItem('bots', JSON.stringify(bots)); }, [bots]);
  useEffect(() => {
    if (activeBotToken) localStorage.setItem('activeBotToken', activeBotToken);
    else localStorage.removeItem('activeBotToken');
  }, [activeBotToken]);
  useEffect(() => { localStorage.setItem('chats', JSON.stringify(chats)); }, [chats]);
  useEffect(() => { localStorage.setItem('messages', JSON.stringify(messages)); }, [messages]);
  useEffect(() => {
    localStorage.setItem('primaryColor', primaryColor);
    document.documentElement.style.setProperty('--primary-color', primaryColor);
    const r = parseInt(primaryColor.slice(1,3),16), g = parseInt(primaryColor.slice(3,5),16), b = parseInt(primaryColor.slice(5,7),16);
    document.documentElement.style.setProperty('--primary-color-hover', `rgb(${Math.max(0,r-30)},${Math.max(0,g-30)},${Math.max(0,b-30)})`);
  }, [primaryColor]);

  // Hardware back button / browser back support
  useEffect(() => {
    const handleBack = () => {
      if (selectedChat) { setSelectedChat(null); return; }
      if (currentView !== 'chats') { setCurrentView('chats'); return; }
    };
    window.addEventListener('popstate', handleBack);
    return () => window.removeEventListener('popstate', handleBack);
  }, [selectedChat, currentView]);

  // Push a history state when navigating
  useEffect(() => {
    if (selectedChat || currentView !== 'chats') {
      window.history.pushState({ view: currentView, chatId: selectedChat?.id }, '');
    }
  }, [selectedChat, currentView]);

  // Bot Polling
  const fetchUpdates = useCallback(async () => {
    if (!activeBotToken) return;
    try {
      const res = await fetch(`${API_BASE}/api/bot/updates?token=${encodeURIComponent(activeBotToken)}`);
      if (!res.ok) return;
      const data = await res.json();

      setChats(prev => {
        let changed = false;
        const next = [...prev];
        data.chats?.forEach((c: Chat) => {
          const idx = next.findIndex(nc => nc.id === c.id);
          if (idx === -1) { next.push({ ...c, unreadCount: 0 }); changed = true; }
          else if (JSON.stringify(next[idx].lastMessage) !== JSON.stringify(c.lastMessage)) {
            next[idx] = { ...next[idx], lastMessage: c.lastMessage, photoUrl: c.photoUrl };
            changed = true;
          }
        });
        return changed ? next : prev;
      });

      setMessages(prev => {
        let changed = false;
        const next = [...prev];
        data.messages?.forEach((m: Message) => {
          if (!next.find(nm => nm.id === m.id)) { next.push(m); changed = true; }
        });
        return changed ? next : prev;
      });

      setChats(prev => {
        const next = prev.map(c => {
          const chatMsgs = data.messages?.filter((m: Message) => m.chatId === c.id) || [];
          if (chatMsgs.length > 0 && selectedChat?.id !== c.id) {
            return { ...c, unreadCount: (c.unreadCount || 0) + chatMsgs.length };
          }
          return c;
        });
        return next;
      });
    } catch {}
  }, [activeBotToken, selectedChat]);

  useEffect(() => {
    fetchUpdates();
    const id = setInterval(fetchUpdates, 3000);
    return () => clearInterval(id);
  }, [fetchUpdates]);

  const handleLogin = async (token: string) => {
    try {
      const res = await fetch(`${API_BASE}/api/bot/init`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });
      const data = await res.json();
      if (data.bot) {
        const botInfo: BotInfo = { token, ...data.bot };
        setBots(prev => {
          if (prev.find(b => b.token === token)) return prev;
          return [...prev.slice(0,2), botInfo];
        });
        setActiveBotToken(token);
        setCurrentView('chats');
      }
    } catch {
      setBots(prev => {
        if (prev.find(b => b.token === token)) return prev;
        return [...prev.slice(0,2), { token, id: Date.now(), first_name: 'Bot' }];
      });
      setActiveBotToken(token);
    }
  };

  const handleLogout = () => {
    const remaining = bots.filter(b => b.token !== activeBotToken);
    setBots(remaining);
    setActiveBotToken(remaining[0]?.token || null);
    setChats([]);
    setMessages([]);
    setShowLogoutConfirm(false);
  };

  const handleSelectChat = (chat: Chat) => {
    setSelectedChat(chat);
    setChats(prev => prev.map(c => c.id === chat.id ? { ...c, unreadCount: 0 } : c));
  };

  const handleSendMessage = async (text: string, replyTo?: ReplyTo) => {
    if (!selectedChat || !activeBotToken) return;
    const msg: Message = {
      id: `local_${Date.now()}`,
      chatId: selectedChat.id,
      from: { id: 0, first_name: 'Bot' },
      type: 'text',
      content: text,
      timestamp: Date.now(),
      replyTo,
    };
    setMessages(prev => [...prev, msg]);
    try {
      await fetch(`${API_BASE}/api/bot/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: activeBotToken, chatId: selectedChat.id, text, replyToMessageId: replyTo?.id }),
      });
    } catch {}
  };

  const handleSendMedia = async (chatId: number, type: 'photo'|'video'|'document', file: File) => {
    if (!activeBotToken) return;
    const formData = new FormData();
    formData.append('token', activeBotToken);
    formData.append('chatId', String(chatId));
    formData.append('type', type);
    formData.append('file', file);
    try {
      await fetch(`${API_BASE}/api/bot/sendMedia`, { method: 'POST', body: formData });
    } catch {}
  };

  const handleBlockChat = (chatId: number, blocked: boolean) => {
    setChats(prev => prev.map(c => c.id === chatId ? { ...c, blocked } : c));
  };

  const handleDeleteMessage = (chatId: number, msgId: string) => {
    setMessages(prev => prev.map(m => m.id === msgId && m.chatId === chatId ? { ...m, deleted: true } : m));
  };

  const handleForwardMessage = async (msg: Message) => {
    if (!activeBotToken || !selectedChat) return;
    const text = `↪️ Forwarded:\n${msg.content}`;
    await handleSendMessage(text);
  };

  const handleMuteChat = (chatId: number, muted: boolean) => {
    setChats(prev => prev.map(c => c.id === chatId ? { ...c, muted } : c));
  };

  const handleClearChat = (chatId: number) => {
    setClearChatId(chatId);
  };

  const confirmClearChat = () => {
    if (clearChatId !== null) {
      setMessages(prev => prev.filter(m => m.chatId !== clearChatId));
      setClearChatId(null);
    }
  };

  const handleReactMessage = (msgId: string, emoji: string) => {
    setMessages(prev => prev.map(m => {
      if (m.id !== msgId) return m;
      const reactions = [...(m.reactions || [])];
      const idx = reactions.indexOf(emoji);
      if (idx > -1) reactions.splice(idx, 1); else reactions.push(emoji);
      return { ...m, reactions };
    }));
  };

  const chatMessages = selectedChat ? messages.filter(m => m.chatId === selectedChat.id) : [];
  const filteredChats = searchQuery
    ? chats.filter(c => c.first_name.toLowerCase().includes(searchQuery.toLowerCase()) || c.username?.toLowerCase().includes(searchQuery.toLowerCase()))
    : chats;

  const activeBot = bots.find(b => b.token === activeBotToken);

  // Not logged in
  if (!splashDone) return (
    <ThemeProvider>
      <Splash onFinish={() => setSplashDone(true)} />
    </ThemeProvider>
  );

  if (!activeBotToken || bots.length === 0 || currentView === 'add_bot') return (
    <ThemeProvider>
      <Login onLogin={handleLogin} />
    </ThemeProvider>
  );

  return (
    <ThemeProvider>
      <div className="flex flex-col h-full bg-white dark:bg-[#121212] overflow-hidden">
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          onLogout={() => setShowLogoutConfirm(true)}
          onNavigate={view => { setCurrentView(view); setSelectedChat(null); }}
          bots={bots}
          activeBotToken={activeBotToken}
          onSwitchBot={token => { setActiveBotToken(token); setSelectedChat(null); setCurrentView('chats'); }}
          onAddBot={() => setCurrentView('add_bot')}
          showAddBot={bots.length < 3}
        />

        <div className="flex-1 overflow-hidden">
          <AnimatePresence mode="wait">
            {selectedChat ? (
              <motion.div key={`chat-${selectedChat.id}`} className="h-full"
                initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 30, stiffness: 300 }}>
                <ChatScreen
                  chat={selectedChat}
                  messages={chatMessages}
                  onBack={() => setSelectedChat(null)}
                  onSendMessage={handleSendMessage}
                  onSendMedia={handleSendMedia}
                  onBlockChat={handleBlockChat}
                  onDeleteMessage={handleDeleteMessage}
                  onForwardMessage={handleForwardMessage}
                  onMuteChat={handleMuteChat}
                  onClearChat={handleClearChat}
                  onReactMessage={handleReactMessage}
                />
              </motion.div>
            ) : currentView === 'settings' ? (
              <motion.div key="settings" className="h-full"
                initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 30, stiffness: 300 }}>
                <Settings
                  onBack={() => setCurrentView('chats')}
                  primaryColor={primaryColor}
                  onColorChange={setPrimaryColor}
                  onClearData={() => setShowClearConfirm(true)}
                  botToken={activeBotToken}
                />
              </motion.div>
            ) : currentView === 'about' || currentView === 'help' ? (
              <motion.div key="about" className="h-full"
                initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 30, stiffness: 300 }}>
                <AboutView onBack={() => setCurrentView('chats')} type={currentView === 'help' ? 'help' : 'about'} />
              </motion.div>
            ) : currentView === 'broadcast' ? (
              <motion.div key="broadcast" className="h-full"
                initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 30, stiffness: 300 }}>
                <BroadcastScreen chats={chats} botToken={activeBotToken} onBack={() => setCurrentView('chats')} />
              </motion.div>
            ) : (
              <motion.div key="chatlist" className="h-full relative"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <ChatList
                  chats={filteredChats}
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  onSelectChat={handleSelectChat}
                  onOpenMenu={() => setIsSidebarOpen(true)}
                  botToken={activeBotToken}
                />
                <button onClick={() => setCurrentView('broadcast')}
                  className="absolute bottom-4 right-4 w-12 h-12 rounded-full shadow-lg flex items-center justify-center hover:scale-105 active:scale-95 transition-all z-10"
                  style={{ backgroundColor: primaryColor }}>
                  <Megaphone className="w-5 h-5 text-white" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <ConfirmModal isOpen={showLogoutConfirm} title="Remove Bot"
          message="Remove this bot from Memegram? You can add it back anytime."
          confirmText="Remove" isDanger onConfirm={handleLogout} onCancel={() => setShowLogoutConfirm(false)} />
        <ConfirmModal isOpen={showClearConfirm} title="Clear All Data"
          message="This will delete all chats and messages. Cannot be undone."
          confirmText="Clear All" isDanger onConfirm={() => { setChats([]); setMessages([]); setShowClearConfirm(false); }} onCancel={() => setShowClearConfirm(false)} />
        <ConfirmModal isOpen={clearChatId !== null} title="Clear Chat"
          message="Delete all messages in this conversation?"
          confirmText="Clear" isDanger onConfirm={confirmClearChat} onCancel={() => setClearChatId(null)} />
      </div>
    </ThemeProvider>
  );
}
