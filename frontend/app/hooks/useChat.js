import { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';

export const useChat = (userId, userRole = 'user') => {
  const [messages, setMessages] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [chatHistory, setChatHistory] = useState([]);
  const [activeChats, setActiveChats] = useState([]); // Admin için
  const [currentChat, setCurrentChat] = useState(null);
  
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);

  // Otomatik cevap sistemi
  const generateAutoReply = (userMessage) => {
    const message = userMessage.toLowerCase();
    
    // Selamlaşma
    if (message.includes('merhaba') || message.includes('selam') || message.includes('hi') || message.includes('hello')) {
      return 'Merhaba! Size nasıl yardımcı olabilirim? 😊';
    }
    
    // Yardım
    if (message.includes('yardım') || message.includes('help') || message.includes('nasıl')) {
      return 'Size yardımcı olmaktan mutluluk duyarım! Hangi konuda destek istiyorsunuz? 🤔';
    }
    
    // Ürünler
    if (message.includes('ürün') || message.includes('product')) {
      return 'Ürünlerimizi görmek için "Ürünler" sayfasını ziyaret edebilirsiniz! 📦';
    }
    
    // Fiyat
    if (message.includes('fiyat') || message.includes('price') || message.includes('ne kadar')) {
      return 'Fiyat bilgileri için ürün detay sayfalarını inceleyebilirsiniz! 💰';
    }
    
    // Stok
    if (message.includes('stok') || message.includes('stock') || message.includes('var mı')) {
      return 'Stok durumunu kontrol etmek için ürün sayfalarını ziyaret edebilirsiniz! 📊';
    }
    
    // İletişim
    if (message.includes('iletişim') || message.includes('contact') || message.includes('telefon')) {
      return 'İletişim bilgilerimiz için profil sayfamızı ziyaret edebilirsiniz! 📞';
    }
    
    // Teşekkür
    if (message.includes('teşekkür') || message.includes('thanks') || message.includes('sağol')) {
      return 'Rica ederim! Başka bir konuda yardıma ihtiyacınız olursa çekinmeyin! 😊';
    }
    
    // Veda
    if (message.includes('görüşürüz') || message.includes('bye') || message.includes('hoşça kal')) {
      return 'Görüşmek üzere! İyi günler! 👋';
    }
    
    // Genel cevap
    const generalReplies = [
      'Anlıyorum! Size nasıl yardımcı olabilirim? 🤔',
      'Bu konuda size yardımcı olmaya çalışayım! 💪',
      'İlginiz için teşekkürler! Başka bir sorunuz var mı? 😊',
      'Bu konuyu araştırıp size en iyi cevabı vermeye çalışacağım! 🔍',
      'Anladım! Size en uygun çözümü bulalım! ✨'
    ];
    
    return generalReplies[Math.floor(Math.random() * generalReplies.length)];
  };

  // WebSocket bağlantısı - Sessiz mod
  const connectWebSocket = () => {
    // Backend hazır olana kadar bağlantı deneme
    if (!userId) return;
    
    try {
      const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:6602';
      wsRef.current = new WebSocket(`${wsUrl}/chat?userId=${userId}&role=${userRole}`);

      wsRef.current.onopen = () => {
        setIsConnected(true);
        // Sessiz mod - toast mesajı yok
      };

      wsRef.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        handleIncomingMessage(data);
      };

      wsRef.current.onclose = () => {
        setIsConnected(false);
        // Sessiz mod - toast mesajı yok
        
        // Yeniden bağlanma - sadece 1 kez
        if (!reconnectTimeoutRef.current) {
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectTimeoutRef.current = null;
            // Backend hazır olana kadar tekrar deneme
          }, 5000);
        }
      };

      wsRef.current.onerror = (error) => {
        // Sessiz mod - console.error ve toast yok
        setIsConnected(false);
      };
    } catch (error) {
      // Sessiz mod - console.error yok
      setIsConnected(false);
    }
  };

  // Gelen mesajları işle
  const handleIncomingMessage = (data) => {
    switch (data.type) {
      case 'message':
        const newMessage = {
          id: data.messageId,
          senderId: data.senderId,
          senderName: data.senderName,
          content: data.content,
          timestamp: new Date(data.timestamp),
          isRead: false
        };
        
        setMessages(prev => [...prev, newMessage]);
        
        // Okunmamış mesaj sayısını artır
        if (data.senderId !== userId) {
          setUnreadCount(prev => prev + 1);
        }
        
        // Otomatik cevap sistemi
        if (data.senderId !== userId && userRole === 'admin') {
          setTimeout(() => {
            const autoReply = generateAutoReply(data.content);
            sendMessage(autoReply);
          }, 1000 + Math.random() * 2000); // 1-3 saniye arası
        }
        break;
        
      case 'typing':
        setIsTyping(data.isTyping);
        break;
        
      case 'chat_history':
        setChatHistory(data.messages);
        break;
        
      case 'active_chats':
        if (userRole === 'admin') {
          setActiveChats(data.chats);
        }
        break;
        
      case 'chat_started':
        setCurrentChat(data.chatId);
        break;
        
      case 'chat_ended':
        if (currentChat === data.chatId) {
          setCurrentChat(null);
        }
        break;
    }
  };

  // Mesaj gönder
  const sendMessage = (content, recipientId = null) => {
    if (!content.trim()) return;

    // Mesajı hemen ekle (optimistic update)
    const newMessage = {
      id: Date.now().toString(),
      senderId: userId,
      senderName: localStorage.getItem('username') || 'Bilinmeyen',
      content: content.trim(),
      timestamp: new Date(),
      isRead: true
    };

    setMessages(prev => [...prev, newMessage]);

    // Otomatik cevap sistemi - Hemen çalışsın
    setTimeout(() => {
      const autoReply = generateAutoReply(content.trim());
      const botMessage = {
        id: (Date.now() + 1).toString(),
        senderId: 'bot',
        senderName: 'Canlı Destek',
        content: autoReply,
        timestamp: new Date(),
        isRead: false
      };
      setMessages(prev => [...prev, botMessage]);
    }, 1000 + Math.random() * 2000); // 1-3 saniye arası

    // WebSocket bağlantısı varsa gönder
    if (isConnected && wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      const messageData = {
        type: 'message',
        content: content.trim(),
        recipientId: recipientId,
        timestamp: new Date().toISOString()
      };
      wsRef.current.send(JSON.stringify(messageData));
    }
  };

  // Yazıyor durumu gönder
  const sendTypingStatus = (isTyping, recipientId = null) => {
    if (!isConnected) return;

    const typingData = {
      type: 'typing',
      isTyping: isTyping,
      recipientId: recipientId
    };

    wsRef.current.send(JSON.stringify(typingData));
  };

  // Chat başlat (kullanıcı için)
  const startChat = () => {
    if (!isConnected) return;

    const startData = {
      type: 'start_chat'
    };

    wsRef.current.send(JSON.stringify(startData));
  };

  // Chat'i kabul et (admin için)
  const acceptChat = (chatId) => {
    if (!isConnected || userRole !== 'admin') return;

    const acceptData = {
      type: 'accept_chat',
      chatId: chatId
    };

    wsRef.current.send(JSON.stringify(acceptData));
    setCurrentChat(chatId);
  };

  // Chat'i sonlandır
  const endChat = () => {
    if (!isConnected || !currentChat) return;

    const endData = {
      type: 'end_chat',
      chatId: currentChat
    };

    wsRef.current.send(JSON.stringify(endData));
    setCurrentChat(null);
  };

  // Mesajları okundu olarak işaretle
  const markAsRead = (messageIds) => {
    setMessages(prev => 
      prev.map(msg => 
        messageIds.includes(msg.id) ? { ...msg, isRead: true } : msg
      )
    );
    setUnreadCount(0);
  };

  // Chat geçmişini yükle
  const loadChatHistory = (chatId = null) => {
    if (!isConnected) return;

    const historyData = {
      type: 'get_history',
      chatId: chatId
    };

    wsRef.current.send(JSON.stringify(historyData));
  };

  // Aktif chat'leri yükle (admin için)
  const loadActiveChats = () => {
    if (!isConnected || userRole !== 'admin') return;

    const activeData = {
      type: 'get_active_chats'
    };

    wsRef.current.send(JSON.stringify(activeData));
  };

  // Bağlantıyı kapat
  const disconnect = () => {
    if (wsRef.current) {
      wsRef.current.close();
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
  };

  // Component mount olduğunda bağlan - Sessiz mod
  useEffect(() => {
    if (userId) {
      // Backend hazır olana kadar bekle
      const timer = setTimeout(() => {
        connectWebSocket();
      }, 2000);
      
      return () => clearTimeout(timer);
    }

    return () => {
      disconnect();
    };
  }, [userId, userRole]);

  // Mesajları localStorage'a kaydet
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(`chat_messages_${userId}`, JSON.stringify(messages.slice(-50)));
    }
  }, [messages, userId]);

  // LocalStorage'dan mesajları yükle
  useEffect(() => {
    const savedMessages = localStorage.getItem(`chat_messages_${userId}`);
    if (savedMessages) {
      setMessages(JSON.parse(savedMessages));
    }
  }, [userId]);

  return {
    // State
    messages,
    isConnected,
    isTyping,
    unreadCount,
    chatHistory,
    activeChats,
    currentChat,
    
    // Actions
    sendMessage,
    sendTypingStatus,
    startChat,
    acceptChat,
    endChat,
    markAsRead,
    loadChatHistory,
    loadActiveChats,
    disconnect,
    
    // Utils
    isAdmin: userRole === 'admin'
  };
}; 