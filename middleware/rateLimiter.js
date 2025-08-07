const rateLimit = require('express-rate-limit');
const log = require('../utils/logger');

// Genel API rate limiter
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 dakika
  max: 100, // IP başına maksimum 100 istek
  message: {
    error: 'Çok fazla istek gönderildi. Lütfen 15 dakika sonra tekrar deneyin.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    log.security('Rate limit exceeded', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      url: req.url
    });
    res.status(429).json({
      error: 'Çok fazla istek gönderildi. Lütfen 15 dakika sonra tekrar deneyin.'
    });
  }
});

// Login endpoint için özel rate limiter (daha sıkı)
const loginLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 dakika
  max: 10, // IP başına maksimum 10 login denemesi
  message: {
    error: 'Çok fazla giriş denemesi. Lütfen 1 dakika sonra tekrar deneyin.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    log.security('Login rate limit exceeded', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      email: req.body.email
    });
    res.status(429).json({
      error: 'Çok fazla giriş denemesi. Lütfen 1 dakika sonra tekrar deneyin.'
    });
  }
});

// Register endpoint için özel rate limiter
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 saat
  max: 3, // IP başına maksimum 3 kayıt denemesi
  message: {
    error: 'Çok fazla kayıt denemesi. Lütfen 1 saat sonra tekrar deneyin.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    log.security('Register rate limit exceeded', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      email: req.body.email
    });
    res.status(429).json({
      error: 'Çok fazla kayıt denemesi. Lütfen 1 saat sonra tekrar deneyin.'
    });
  }
});

// 2FA endpoint için özel rate limiter
const twoFALimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 dakika
  max: 10, // IP başına maksimum 10 2FA denemesi
  message: {
    error: 'Çok fazla 2FA denemesi. Lütfen 5 dakika sonra tekrar deneyin.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    log.security('2FA rate limit exceeded', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      userId: req.body.userId
    });
    res.status(429).json({
      error: 'Çok fazla 2FA denemesi. Lütfen 5 dakika sonra tekrar deneyin.'
    });
  }
});

// Admin endpoint'leri için özel rate limiter
const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 dakika
  max: 50, // IP başına maksimum 50 istek
  message: {
    error: 'Admin endpoint rate limit exceeded.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    log.security('Admin rate limit exceeded', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      url: req.url
    });
    res.status(429).json({
      error: 'Admin endpoint rate limit exceeded.'
    });
  }
});

// File upload için özel rate limiter
const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 saat
  max: 10, // IP başına maksimum 10 upload
  message: {
    error: 'Çok fazla dosya yükleme denemesi. Lütfen 1 saat sonra tekrar deneyin.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    log.security('Upload rate limit exceeded', {
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });
    res.status(429).json({
      error: 'Çok fazla dosya yükleme denemesi. Lütfen 1 saat sonra tekrar deneyin.'
    });
  }
});

// IP bazlı blacklist (manuel olarak eklenebilir)
const blacklistedIPs = new Set();

const checkBlacklist = (req, res, next) => {
  if (blacklistedIPs.has(req.ip)) {
    log.security('Blacklisted IP attempted access', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      url: req.url
    });
    return res.status(403).json({
      error: 'Bu IP adresi engellenmiştir.'
    });
  }
  next();
};

// IP'yi blacklist'e ekleme fonksiyonu
const addToBlacklist = (ip) => {
  blacklistedIPs.add(ip);
  log.security('IP added to blacklist', { ip });
};

// IP'yi blacklist'ten çıkarma fonksiyonu
const removeFromBlacklist = (ip) => {
  blacklistedIPs.delete(ip);
  log.security('IP removed from blacklist', { ip });
};

module.exports = {
  generalLimiter,
  loginLimiter,
  registerLimiter,
  twoFALimiter,
  adminLimiter,
  uploadLimiter,
  checkBlacklist,
  addToBlacklist,
  removeFromBlacklist
}; 