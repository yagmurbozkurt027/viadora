const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const log = require('../utils/logger');
const { errorHandler, notFoundHandler } = require('../middleware/errorHandler');
const { sanitizeInput } = require('../middleware/validation');
const { 
  generalLimiter, 
  loginLimiter, 
  registerLimiter,
  checkBlacklist 
} = require('../middleware/rateLimiter');

const app = express();

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
    'https://frontend-mmpm5x4rz-yagmurs-projects-54afa3cf.vercel.app',
    'https://frontend-4qqcacg8y-yagmurs-projects-54afa3cf.vercel.app',
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

app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API routes
app.use("/users", require("../routes/userRoutes"));
app.use("/products", require("../routes/productRoutes"));
app.use("/cart", require("../routes/cartRoutes"));
app.use("/orders", require("../routes/orderRoutes"));
app.use("/transactions", require("../routes/transactionRoutes"));
app.use("/comments", require("../routes/commentRoutes"));
app.use("/stats", require("../routes/statsRoutes"));
app.use("/barcode", require("../routes/barcode"));
app.use("/invoices", require("../routes/invoice"));
app.use("/goods-receipt", require("../routes/goodsReceipt"));
app.use("/payments", require("../routes/paymentRoutes"));
app.use("/gamification", require("../routes/gamificationRoutes"));
app.use("/notifications", require("../routes/notificationRoutes"));
app.use("/wholesale", require("../routes/wholesaleRoutes"));

app.use(notFoundHandler);
app.use(errorHandler);

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/viadora")
  .then(() => {
    log.info("MongoDB bağlantısı başarılı");
  })
  .catch(err => {
    log.error("MongoDB bağlantı hatası", { error: err.message });
  });

module.exports = app;
