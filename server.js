require('dotenv').config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const log = require('./utils/logger');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const { sanitizeInput } = require('./middleware/validation');
const { 
  generalLimiter, 
  loginLimiter, 
  registerLimiter,
  checkBlacklist 
} = require('./middleware/rateLimiter');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const WebSocket = require('ws');

const app = express();

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Viadora API',
      version: '1.0.0',
      description: 'E-ticaret uygulaması için REST API',
      contact: {
        name: 'API Destek',
        email: 'destek@butikproje.com'
      }
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 6602}`,
        description: 'Geliştirme sunucusu'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    }
  },
  apis: ['./routes/*.js', './controllers/*.js']
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

app.set('trust proxy', 1);

app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:6600', 
    'http://127.0.0.1:6600',
    'http://localhost:6600',
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'https://frontend-4mnm2m8zy-yagmurs-projects-54afa3cf.vercel.app',
    'https://frontend-ltxmv4ihj-yagmurs-projects-54afa3cf.vercel.app',
    'https://frontend-eoev82wvy-yagmurs-projects-54afa3cf.vercel.app',
    'https://frontend-ligd5qbcv-yagmurs-projects-54afa3cf.vercel.app',
    'https://frontend-ndwlekmok-yagmurs-projects-54afa3cf.vercel.app',
    'https://frontend-9ggy1xhw0-yagmurs-projects-54afa3cf.vercel.app',
    'https://frontend-flft3jd2i-yagmurs-projects-54afa3cf.vercel.app',
    'https://frontend-hnqrz3a7p-yagmurs-projects-54afa3cf.vercel.app',
    'https://viadora.com.tr',
    'https://butik-proje.vercel.app',
    'https://*.vercel.app'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.static("uploads"));

app.use(checkBlacklist);
app.use(sanitizeInput);

app.use(generalLimiter);

app.use((req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    log.api(req, res, duration);
  });
  
  next();
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Test endpoint for gamification
app.get('/api/test-gamification', (req, res) => {
  res.json({
    message: 'Gamification API çalışıyor',
    timestamp: new Date().toISOString()
  });
});

app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/products", require("./routes/productRoutes"));
app.use("/api/cart", require("./routes/cartRoutes"));
app.use("/api/orders", require("./routes/orderRoutes"));
app.use("/api/transactions", require("./routes/transactionRoutes"));
app.use("/api/comments", require("./routes/commentRoutes"));
app.use("/api/stats", require("./routes/statsRoutes"));

// Yeni sistem route'ları
app.use("/api/barcode", require("./routes/barcode"));
app.use("/api/invoices", require("./routes/invoice"));
app.use("/api/goods-receipt", require("./routes/goodsReceipt"));
app.use("/api/payments", require("./routes/paymentRoutes"));
app.use("/api/gamification", require("./routes/gamificationRoutes"));
app.use("/api/notifications", require("./routes/notificationRoutes"));
app.use("/api/wholesale", require("./routes/wholesaleRoutes"));

app.use(notFoundHandler);

app.use(errorHandler);

// WebSocket server oluştur
const server = require('http').createServer(app);
const wss = new WebSocket.Server({ server });

// WebSocket bağlantıları için storage
const chatConnections = new Map();
const chatRooms = new Map();

// WebSocket bağlantı yönetimi
wss.on('connection', (ws, req) => {
  console.log('Yeni WebSocket bağlantısı:', req.url);
  
  // URL'den userId ve role'ü al
  const url = new URL(req.url, 'http://localhost');
  const userId = url.searchParams.get('userId');
  const role = url.searchParams.get('role');
  
  if (!userId) {
    ws.close(1008, 'userId gerekli');
    return;
  }
  
  // Bağlantıyı kaydet
  chatConnections.set(userId, {
    ws,
    role,
    isTyping: false,
    lastActivity: Date.now()
  });
  
  console.log(`Kullanıcı bağlandı: ${userId} (${role})`);
  
  // Hoş geldin mesajı gönder
  ws.send(JSON.stringify({
    type: 'connection_established',
    message: 'Chat bağlantısı kuruldu!',
    userId,
    role
  }));
  
  // Mesaj alma
  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data);
      console.log('Gelen mesaj:', message);
      
      switch (message.type) {
        case 'message':
          handleChatMessage(userId, role, message);
          break;
        case 'typing':
          handleTypingStatus(userId, message.isTyping);
          break;
        case 'start_chat':
          handleStartChat(userId, role);
          break;
        case 'end_chat':
          handleEndChat(userId);
          break;
        default:
          console.log('Bilinmeyen mesaj tipi:', message.type);
      }
    } catch (error) {
      console.error('Mesaj işleme hatası:', error);
    }
  });
  
  // Bağlantı kapanma
  ws.on('close', () => {
    console.log(`Kullanıcı ayrıldı: ${userId}`);
    chatConnections.delete(userId);
    
    // Diğer kullanıcılara bildir
    broadcastToAll({
      type: 'user_disconnected',
      userId,
      role
    });
  });
  
  // Hata durumu
  ws.on('error', (error) => {
    console.error('WebSocket hatası:', error);
    chatConnections.delete(userId);
  });
});

// Chat mesajı işleme
function handleChatMessage(senderId, senderRole, message) {
  const chatMessage = {
    type: 'message',
    senderId,
    senderRole,
    senderName: message.senderName || 'Bilinmeyen',
    content: message.content,
    timestamp: Date.now(),
    messageId: Date.now().toString()
  };
  
  // Mesajı kaydet (veritabanına da eklenebilir)
  if (!chatRooms.has('general')) {
    chatRooms.set('general', []);
  }
  chatRooms.get('general').push(chatMessage);
  
  // Tüm bağlı kullanıcılara gönder
  broadcastToAll(chatMessage);
}

// Typing durumu işleme
function handleTypingStatus(userId, isTyping) {
  const connection = chatConnections.get(userId);
  if (connection) {
    connection.isTyping = isTyping;
    connection.lastActivity = Date.now();
  }
  
  broadcastToAll({
    type: 'typing',
    userId,
    isTyping,
    role: connection?.role
  });
}

// Chat başlatma
function handleStartChat(userId, role) {
  const connection = chatConnections.get(userId);
  if (connection) {
    connection.lastActivity = Date.now();
  }
  
  broadcastToAll({
    type: 'chat_started',
    userId,
    role,
    timestamp: Date.now()
  });
}

// Chat bitirme
function handleEndChat(userId) {
  const connection = chatConnections.get(userId);
  if (connection) {
    connection.lastActivity = Date.now();
  }
  
  broadcastToAll({
    type: 'chat_ended',
    userId,
    timestamp: Date.now()
  });
}

// Tüm bağlı kullanıcılara mesaj gönderme
function broadcastToAll(message) {
  chatConnections.forEach((connection, userId) => {
    if (connection.ws.readyState === WebSocket.OPEN) {
      connection.ws.send(JSON.stringify(message));
    }
  });
}

// Belirli kullanıcıya mesaj gönderme
function sendToUser(userId, message) {
  const connection = chatConnections.get(userId);
  if (connection && connection.ws.readyState === WebSocket.OPEN) {
    connection.ws.send(JSON.stringify(message));
  }
}

mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/viadora")
  .then(() => {
    log.info("MongoDB bağlantısı başarılı");
  })
  .catch(err => {
    log.error("MongoDB bağlantı hatası", { error: err.message });
  });

const PORT = process.env.PORT || 6602;
server.listen(PORT, () => {
  log.info(`Server başlatıldı`, {
    port: PORT,
    environment: process.env.NODE_ENV || 'development',
    apiDocs: `http://localhost:${PORT}/api-docs`,
    healthCheck: `http://localhost:${PORT}/health`,
    websocket: `ws://localhost:${PORT}/chat`
  });
});