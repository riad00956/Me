/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Chat, Message, BotInfo } from './types';
import Splash from './components/Splash';
import Login from './components/Login';
import ChatList from './components/ChatList';
import ChatScreen from './context/ChatScreen';
import Sidebar from './components/Sidebar';
import SettingsView from './components/Settings';
import AboutView from './components/AboutView';
import ConfirmModal from './context/ConfirmModal';

export default function App() {
  const [isSplashFinished, setIsSplashFinished] = useState(false);
  const [bots, setBots] = useState<BotInfo[]>(() => JSON.parse(localStorage.getItem('bots') || '[]'));
  const [activeBotToken, setActiveBotToken] = useState<string | null>(() => localStorage.getItem('activeBotToken'));
  const [chats, setChats] = useState<Chat[]>(() => JSON.parse(localStorage.getItem('chats') || '[]'));
  const [messages, setMessages] = useState<Message[]>(() => JSON.parse(localStorage.getItem('messages') || '[]'));
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentView, setCurrentView] = useState<'chats' | 'settings' | 'about' | 'help' | 'add_bot'>('chats');
  const [searchQuery, setSearchQuery] = useState('');
  const [primaryColor, setPrimaryColor] = useState(() => localStorage.getItem('primaryColor') || '#3b82f6');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Persistence
  useEffect(() => {
    localStorage.setItem('bots', JSON.stringify(bots));
  }, [bots]);

  useEffect(() => {
    if (activeBotToken) localStorage.setItem('activeBotToken', activeBotToken);
    else localStorage.removeItem('activeBotToken');
  }, [activeBotToken]);

  useEffect(() => {
    localStorage.setItem('chats', JSON.stringify(chats));
  }, [chats]);

  useEffect(() => {
    localStorage.setItem('messages', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    localStorage.setItem('primaryColor', primaryColor);
    document.documentElement.style.setProperty('--primary-color', primaryColor);
    // Generate a darker version for hover
    const r = parseInt(primaryColor.slice(1, 3), 16);
    const g = parseInt(primaryColor.slice(3, 5), 16);
    const b = parseInt(primaryColor.slice(5, 7), 16);
    const hoverColor = `rgb(${Math.max(0, r - 30)}, ${Math.max(0, g - 30)}, ${Math.max(0, b - 30)})`;
    document.documentElement.style.setProperty('--primary-color-hover', hoverColor);
  }, [primaryColor]);

  // Bot Polling
  const fetchUpdates = useCallback(async () => {
    if (!activeBotToken) return;
    try {
      const res = await fetch(`/api/bot/updates?token=${encodeURIComponent(activeBotToken)}`);
      if (!res.ok) throw new Error('Network error');
      const data = await res.json();
      
      // Merge chats
      setChats(prev => {
        let changed = false;
        const newChats = [...prev];
        data.chats.forEach((c: Chat) => {
          if (!newChats.find(nc => nc.id === c.id)) {
            newChats.push(c);
            changed = true;
          }
        });
        return changed ? newChats : prev;
      });

      // Merge messages
      setMessages(prev => {
        let changed = false;
        const newMessages = [...prev];
        data.messages.forEach((m: Message) => {
          if (!newMessages.find(nm => nm.id === m.id)) {
            newMessages.push(m);
            changed = true;
          }
        });
        return changed ? newMessages : prev;
      });
    } catch (error) {
      console.error('Failed to fetch updates:', error);
    }
  }, [activeBotToken]);

  useEffect(() => {
    if (activeBotToken) {
      // Init bot on server
      fetch('/api/bot/init', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: activeBotToken }),
      });

      const interval = setInterval(fetchUpdates, 2000);
      return () => clearInterval(interval);
    }
  }, [activeBotToken, fetchUpdates]);

  const handleLogin = async (token: string) => {
    if (bots.length >= 3 && !bots.find(b => b.token === token)) {
      alert('Maximum 3 bots allowed.');
      return;
    }
    if (bots.find(b => b.token === token)) {
      setActiveBotToken(token);
      setCurrentView('chats');
      return;
    }

    try {
      const res = await fetch('/api/bot/init', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });
      const data = await res.json();
      if (data.success) {
        const newBot: BotInfo = { ...data.bot, token };
        setBots(prev => [...prev, newBot]);
        setActiveBotToken(token);
        setCurrentView('chats');
      } else {
        alert('Invalid Bot Token');
      }
    } catch (e) {
      alert('Failed to initialize bot');
    }
  };

  const handleLogout = () => {
    setBots([]);
    setActiveBotToken(null);
    setChats([]);
    setMessages([]);
    setSelectedChat(null);
    setIsSidebarOpen(false);
    setCurrentView('chats');
    setSearchQuery('');
    localStorage.clear();
    // Reset primary color to default
    setPrimaryColor('#3b82f6');
    setShowLogoutConfirm(false);
  };

  const handleClearData = () => {
    setChats([]);
    setMessages([]);
    setSelectedChat(null);
    localStorage.setItem('chats', '[]');
    localStorage.setItem('messages', '[]');
    setShowClearConfirm(false);
  };

  const handleSendMessage = async (text: string) => {
    if (!selectedChat || !activeBotToken) return;
    try {
      const res = await fetch('/api/bot/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: activeBotToken, chatId: selectedChat.id, text }),
      });
      const data = await res.json();
      if (data.success) {
        setMessages(prev => [...prev, data.message]);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleSendMedia = async (chatId: number, type: 'photo' | 'video' | 'document', file: File, caption?: string) => {
    if (!activeBotToken) return;
    const formData = new FormData();
    formData.append('token', activeBotToken);
    formData.append('chatId', chatId.toString());
    formData.append('type', type);
    formData.append('file', file);
    if (caption) formData.append('caption', caption);

    try {
      const response = await fetch('/api/bot/sendMedia', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      if (data.success) {
        setMessages(prev => [...prev, data.message]);
      } else {
        alert('Failed to send media: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error sending media:', error);
    }
  };

  const handleBlockChat = async (chatId: number, blocked: boolean) => {
    if (!activeBotToken) return;
    try {
      const response = await fetch('/api/bot/block', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: activeBotToken, chatId, blocked }),
      });
      if (response.ok) {
        setChats(prev => prev.map(c => c.id === chatId ? { ...c, blocked } : c));
        if (selectedChat?.id === chatId) {
          setSelectedChat(prev => prev ? { ...prev, blocked } : null);
        }
      }
    } catch (error) {
      console.error('Error blocking chat:', error);
    }
  };

  if (!isSplashFinished) {
    return <Splash onFinish={() => setIsSplashFinished(true)} />;
  }

  if (bots.length === 0 || currentView === 'add_bot') {
    return <Login onLogin={handleLogin} onBack={bots.length > 0 ? () => setCurrentView('chats') : undefined} />;
  }

  const renderContent = () => {
    return (
      <AnimatePresence mode="wait">
        {selectedChat ? (
          <motion.div
            key={`chat-${selectedChat.id}`}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="h-full w-full"
          >
            <ChatScreen
              chat={selectedChat}
              messages={messages.filter(m => m.chatId === selectedChat.id)}
              onBack={() => setSelectedChat(null)}
              onSendMessage={handleSendMessage}
              onSendMedia={handleSendMedia}
              onBlockChat={handleBlockChat}
            />
          </motion.div>
        ) : (
          <motion.div
            key={currentView}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{ duration: 0.2 }}
            className="h-full w-full"
          >
            {(() => {
              switch (currentView) {
                case 'settings':
                  return (
                    <SettingsView
                      onBack={() => setCurrentView('chats')}
                      onClearData={() => setShowClearConfirm(true)}
                      onUpdateToken={handleLogin}
                      onNavigate={setCurrentView}
                      botToken={activeBotToken || ''}
                      primaryColor={primaryColor}
                      onColorChange={setPrimaryColor}
                    />
                  );
                case 'about':
                  return (
                    <AboutView
                      onBack={() => setCurrentView('chats')}
                      type="about"
                    />
                  );
                case 'help':
                  return (
                    <AboutView
                      onBack={() => setCurrentView('chats')}
                      type="help"
                    />
                  );
                case 'chats':
                default:
                  const filteredChats = chats
                    .filter(c => 
                      c.first_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                      (c.username && c.username.toLowerCase().includes(searchQuery.toLowerCase()))
                    )
                    .map(c => ({
                      ...c,
                      lastMessage: messages.filter(m => m.chatId === c.id).sort((a, b) => b.timestamp - a.timestamp)[0]
                    }));

                  return (
                    <ChatList
                      chats={filteredChats}
                      searchQuery={searchQuery}
                      onSearchChange={setSearchQuery}
                      onSelectChat={setSelectedChat}
                      onOpenMenu={() => setIsSidebarOpen(true)}
                      botToken={activeBotToken}
                    />
                  );
              }
            })()}
          </motion.div>
        )}
      </AnimatePresence>
    );
  };

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col bg-white dark:bg-[#1c1c1c]">
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onLogout={() => setShowLogoutConfirm(true)}
        onNavigate={(view) => setCurrentView(view)}
        bots={bots}
        activeBotToken={activeBotToken}
        onSwitchBot={(token) => {
          setActiveBotToken(token);
          setSelectedChat(null);
          setIsSidebarOpen(false);
          setCurrentView('chats');
        }}
        onAddBot={() => {
          setCurrentView('add_bot');
          setSelectedChat(null);
          setIsSidebarOpen(false);
        }}
        showAddBot={bots.length < 3}
      />
      
      <div className="flex-1 relative">
        {renderContent()}
      </div>

      <ConfirmModal
        isOpen={showLogoutConfirm}
        title="Logout"
        message="Are you sure you want to logout? All data will be cleared from this device."
        confirmText="Logout"
        cancelText="Cancel"
        onConfirm={handleLogout}
        onCancel={() => setShowLogoutConfirm(false)}
        variant="danger"
      />

      <ConfirmModal
        isOpen={showClearConfirm}
        title="Clear Data"
        message="Are you sure you want to clear all chats and messages? This cannot be undone."
        confirmText="Clear All"
        cancelText="Cancel"
        onConfirm={handleClearData}
        onCancel={() => setShowClearConfirm(false)}
        variant="danger"
      />
    </div>
  );
}

