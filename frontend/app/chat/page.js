'use client';
import { useState, useEffect } from 'react';
import { useChat } from '../hooks/useChat';
import { toast } from 'react-toastify';

export default function ChatPage() {
  const [userId, setUserId] = useState('');
  const [userRole, setUserRole] = useState('user');
  const [message, setMessage] = useState('');
  const [isDark, setIsDark] = useState(false);

  const {
    messages,
    isConnected,
    isTyping,
    unreadCount,
    chatHistory,
    activeChats,
    currentChat,
    sendMessage,
    sendTypingStatus,
    startChat,
    acceptChat,
    endChat,
    markAsRead,
    loadChatHistory,
    loadActiveChats,
    disconnect,
    isAdmin
  } = useChat(userId, userRole);

  useEffect(() => {
    // Kullanıcı bilgilerini al
    const storedUserId = localStorage.getItem('userId');
    const storedRole = localStorage.getItem('role');
    
    if (storedUserId) setUserId(storedUserId);
    if (storedRole) setUserRole(storedRole);

    // Dark mode kontrolü
    const checkTheme = () => {
      setIsDark(document.documentElement.classList.contains("dark"));
    };
    checkTheme();
    
    const themeObserver = new MutationObserver(checkTheme);
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => themeObserver.disconnect();
  }, []);

  const handleSendMessage = () => {
    if (!message.trim()) return;
    
    sendMessage(message);
    setMessage('');
    toast.success('Mesaj gönderildi!');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!userId) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-800'}`}>
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Giriş Yapın</h2>
          <p>Chat özelliğini kullanmak için giriş yapmanız gerekiyor.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-800'}`}>
      <div className="max-w-4xl mx-auto p-4">
        {/* Header */}
        <div className={`rounded-lg shadow-lg p-4 mb-6 transition-colors duration-300 ${
          isDark 
            ? 'bg-gray-800 border border-gray-700' 
            : 'bg-white border border-gray-200'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">💬 Chat Sistemi</h1>
              <p className="text-sm opacity-75">
                {isConnected ? '🟢 Bağlı' : '🔴 Bağlantı Yok'}
                {isAdmin && ' | Admin Modu'}
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              {isAdmin && (
                <button
                  onClick={loadActiveChats}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    isDark 
                      ? 'bg-blue-600 hover:bg-blue-700' 
                      : 'bg-blue-500 hover:bg-blue-600'
                  } text-white`}
                >
                  Aktif Chatler ({activeChats.length})
                </button>
              )}
              
              <button
                onClick={startChat}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  isDark 
                    ? 'bg-green-600 hover:bg-green-700' 
                    : 'bg-green-500 hover:bg-green-600'
                } text-white`}
              >
                {isAdmin ? 'Chat Başlat' : 'Destek İste'}
              </button>
            </div>
          </div>
        </div>

        {/* Chat Container */}
        <div className={`rounded-lg shadow-lg transition-colors duration-300 ${
          isDark 
            ? 'bg-gray-800 border border-gray-700' 
            : 'bg-white border border-gray-200'
        }`}>
          {/* Messages Area */}
          <div className="h-96 overflow-y-auto p-4 border-b border-gray-300 dark:border-gray-600">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                <p>Henüz mesaj yok...</p>
                <p className="text-sm mt-2">Mesaj göndermeye başlayın!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex ${msg.senderId === userId ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        msg.senderId === userId
                          ? isDark
                            ? 'bg-blue-600 text-white'
                            : 'bg-blue-500 text-white'
                          : isDark
                            ? 'bg-gray-700 text-white'
                            : 'bg-gray-200 text-gray-800'
                      }`}
                    >
                      <div className="text-xs opacity-75 mb-1">
                        {msg.senderName || 'Bilinmeyen'}
                      </div>
                      <div>{msg.content}</div>
                      <div className="text-xs opacity-75 mt-1">
                        {new Date(msg.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))}
                
                {isTyping && (
                  <div className="flex justify-start">
                    <div className={`px-4 py-2 rounded-lg ${
                      isDark ? 'bg-gray-700' : 'bg-gray-200'
                    }`}>
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="p-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={message}
                onChange={(e) => {
                  setMessage(e.target.value);
                  sendTypingStatus(true);
                }}
                onKeyPress={handleKeyPress}
                onBlur={() => sendTypingStatus(false)}
                placeholder="Mesajınızı yazın..."
                className={`flex-1 px-4 py-2 rounded-lg border transition-colors ${
                  isDark 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-800 placeholder-gray-500'
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
              <button
                onClick={handleSendMessage}
                disabled={!message.trim() || !isConnected}
                className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                  isConnected && message.trim()
                    ? isDark
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-blue-500 hover:bg-blue-600 text-white'
                    : isDark
                      ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Gönder
              </button>
            </div>
          </div>
        </div>

        {/* Chat History (Admin için) */}
        {isAdmin && chatHistory.length > 0 && (
          <div className={`mt-6 rounded-lg shadow-lg p-4 transition-colors duration-300 ${
            isDark 
              ? 'bg-gray-800 border border-gray-700' 
              : 'bg-white border border-gray-200'
          }`}>
            <h3 className="text-lg font-bold mb-4">Chat Geçmişi</h3>
            <div className="space-y-2">
              {chatHistory.map((chat, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                  onClick={() => loadChatHistory(chat.id)}
                >
                  <div className="flex justify-between items-center">
                    <span>{chat.userName || 'Bilinmeyen Kullanıcı'}</span>
                    <span className="text-sm opacity-75">
                      {new Date(chat.lastMessageTime).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 