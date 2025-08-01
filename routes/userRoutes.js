const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const { validate, sanitizeInput } = require('../middleware/validation');
const { loginLimiter, registerLimiter, twoFALimiter } = require('../middleware/rateLimiter');
const { asyncHandler } = require('../middleware/errorHandler');
const log = require('../utils/logger');

const {
  registerUser,
  loginUser,
  updateUserProfile,
  setup2FA,
  verify2FA,
  getLoginHistory,
  checkPasswordStrength,
  toggleFavorite,
  getFavorites
} = require('../controllers/userController');

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - username
 *         - email
 *         - password
 *       properties:
 *         username:
 *           type: string
 *           description: Kullanıcı adı
 *         email:
 *           type: string
 *           format: email
 *           description: E-posta adresi
 *         password:
 *           type: string
 *           description: Şifre
 *         phone:
 *           type: string
 *           description: Telefon numarası
 *         birthDate:
 *           type: string
 *           format: date
 *           description: Doğum tarihi
 *         gender:
 *           type: string
 *           enum: [erkek, kadın, diğer]
 *           description: Cinsiyet
 *         address:
 *           type: object
 *           properties:
 *             city:
 *               type: string
 *             district:
 *               type: string
 *             postalCode:
 *               type: string
 *             fullAddress:
 *               type: string
 */

/**
 * @swagger
 * /api/users/register:
 *   post:
 *     summary: Yeni kullanıcı kaydı
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: Kullanıcı başarıyla oluşturuldu
 *       400:
 *         description: Geçersiz veri
 *       409:
 *         description: E-posta zaten kullanımda
 */
router.post('/register', 
  registerLimiter,
  sanitizeInput,
  validate('userRegister'),
  asyncHandler(async (req, res) => {
    const { username, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ error: "Bu e-posta adresi zaten kullanımda." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      username,
      email,
      password: hashedPassword
    });

    await user.save();

    log.user('User registered', user._id, { email, username });

    res.status(201).json({
      message: "Kullanıcı başarıyla oluşturuldu.",
      user: {
        _id: user._id,
        username: user.username,
        email: user.email
      }
    });
  })
);

/**
 * @swagger
 * /api/users/login:
 *   post:
 *     summary: Kullanıcı girişi
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Giriş başarılı
 *       401:
 *         description: Geçersiz kimlik bilgileri
 */
router.post('/login', 
  loginLimiter,
  sanitizeInput,
  validate('userLogin'),
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      log.security('Login failed - user not found', { email });
      return res.status(401).json({ error: "Geçersiz e-posta veya şifre." });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      log.security('Login failed - invalid password', { email });
      return res.status(401).json({ error: "Geçersiz e-posta veya şifre." });
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET || "gizli-anahtar",
      { expiresIn: "24h" }
    );

    const loginInfo = {
      device: req.get('User-Agent') || 'Unknown',
      browser: req.get('User-Agent') || 'Unknown',
      ip: req.ip,
      location: 'Unknown',
      timestamp: new Date(),
      success: true
    };

    user.loginHistory.push(loginInfo);
    await user.save();

    log.user('User logged in', user._id, { email, ip: req.ip });

    res.json({
      message: "Giriş başarılı!",
      token,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email
      }
    });
  })
);

/**
 * @swagger
 * /api/users/update-profile:
 *   put:
 *     summary: Kullanıcı profilini güncelle
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       200:
 *         description: Profil başarıyla güncellendi
 *       400:
 *         description: Geçersiz veri
 *       404:
 *         description: Kullanıcı bulunamadı
 */
router.put('/update-profile', 
  sanitizeInput,
  asyncHandler(async (req, res) => {
    const {
      userId,
      username,
      email,
      phone,
      birthDate,
      gender,
      address,
      notifications,
      privacy
    } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "Kullanıcı bulunamadı." });
    }

    // Temel bilgileri güncelle
    user.username = username;
    user.email = email;

    // Yeni alanları güncelle (varsa)
    if (phone !== undefined) user.phone = phone;
    if (birthDate !== undefined) user.birthDate = birthDate;
    if (gender !== undefined) user.gender = gender;
    if (address !== undefined) user.address = address;
    if (notifications !== undefined) user.notifications = notifications;
    if (privacy !== undefined) user.privacy = privacy;

    await user.save();

    log.user('Profile updated', user._id, { username, email });

    res.json({
      message: "Profil güncellendi.",
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        phone: user.phone,
        birthDate: user.birthDate,
        gender: user.gender,
        address: user.address,
        notifications: user.notifications,
        privacy: user.privacy
      }
    });
  })
);

/**
 * @swagger
 * /api/users/setup-2fa:
 *   post:
 *     summary: İki faktörlü doğrulama kurulumu
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *             properties:
 *               userId:
 *                 type: string
 *     responses:
 *       200:
 *         description: 2FA secret oluşturuldu
 *       404:
 *         description: Kullanıcı bulunamadı
 */
router.post('/setup-2fa', 
  twoFALimiter,
  sanitizeInput,
  asyncHandler(async (req, res) => {
    const { userId } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "Kullanıcı bulunamadı." });
    }

    const speakeasy = require('speakeasy');
    const secret = speakeasy.generateSecret({
      name: `Butik Proje (${user.email})`
    });

    user.twoFactorSecret = secret.base32;
    await user.save();

    log.user('2FA setup initiated', user._id);

    res.json({
      secret: secret.base32,
      qrCode: secret.otpauth_url
    });
  })
);

/**
 * @swagger
 * /api/users/verify-2fa:
 *   post:
 *     summary: İki faktörlü doğrulama doğrulama
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - token
 *             properties:
 *               userId:
 *                 type: string
 *               token:
 *                 type: string
 *     responses:
 *       200:
 *         description: 2FA doğrulandı
 *       400:
 *         description: Geçersiz token
 *       404:
 *         description: Kullanıcı bulunamadı
 */
router.post('/verify-2fa', 
  twoFALimiter,
  sanitizeInput,
  asyncHandler(async (req, res) => {
    const { userId, token } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "Kullanıcı bulunamadı." });
    }

    const speakeasy = require('speakeasy');
    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token: token
    });

    if (!verified) {
      log.security('2FA verification failed', { userId });
      return res.status(400).json({ error: "Geçersiz doğrulama kodu." });
    }

    user.twoFactorEnabled = true;
    await user.save();

    log.user('2FA enabled', user._id);

    res.json({
      message: "İki faktörlü doğrulama başarıyla etkinleştirildi."
    });
  })
);

/**
 * @swagger
 * /api/users/login-history/{userId}:
 *   get:
 *     summary: Kullanıcı giriş geçmişi
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Giriş geçmişi
 *       404:
 *         description: Kullanıcı bulunamadı
 */
router.get('/login-history/:userId', 
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ error: "Kullanıcı bulunamadı." });
    }

    res.json({
      loginHistory: user.loginHistory.slice(-10) // Son 10 giriş
    });
  })
);

/**
 * @swagger
 * /api/users/check-password-strength:
 *   post:
 *     summary: Şifre gücü kontrolü
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - password
 *             properties:
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Şifre gücü analizi
 */
router.post('/check-password-strength', 
  sanitizeInput,
  asyncHandler(async (req, res) => {
    const { password } = req.body;

    let strength = 0;
    let feedback = [];

    // Uzunluk kontrolü
    if (password.length >= 8) strength += 20;
    else feedback.push("En az 8 karakter olmalı");

    // Büyük harf kontrolü
    if (/[A-Z]/.test(password)) strength += 20;
    else feedback.push("En az bir büyük harf içermeli");

    // Küçük harf kontrolü
    if (/[a-z]/.test(password)) strength += 20;
    else feedback.push("En az bir küçük harf içermeli");

    // Rakam kontrolü
    if (/[0-9]/.test(password)) strength += 20;
    else feedback.push("En az bir rakam içermeli");

    // Özel karakter kontrolü
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength += 20;
    else feedback.push("En az bir özel karakter içermeli");

    res.json({
      strength,
      feedback,
      isStrong: strength >= 80
    });
  })
);

// Favori ürün ekle/çıkar
router.post('/toggle-favorite', sanitizeInput, asyncHandler(toggleFavorite));

// Kullanıcının favori ürünlerini getir
router.get('/favorites/:userId', sanitizeInput, asyncHandler(getFavorites));

// Kullanıcı stoklarına ürün ekleme endpointi
router.post('/user-stock', async (req, res) => {
  try {
    const { userId, productId, quantity } = req.body;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'Kullanıcı bulunamadı.' });
    }

    const existingStock = user.stocks.find(stock => stock.productId.toString() === productId);
    if (existingStock) {
      existingStock.quantity += quantity;
      // Eğer miktar 0 veya daha az olursa, ürünü stoklardan kaldır
      if (existingStock.quantity <= 0) {
        user.stocks = user.stocks.filter(stock => stock.productId.toString() !== productId);
      }
    } else {
      // Yeni ürün eklerken sadece pozitif değerler kabul et
      if (quantity > 0) {
        user.stocks.push({ productId, quantity });
      }
    }

    await user.save();
    res.json({ message: 'Ürün stoka eklendi.' });
  } catch (err) {
    res.status(500).json({ error: 'Bir hata oluştu.' });
  }
});

// Kullanıcı stoklarından ürün silme endpointi
router.post('/user-stock-remove', async (req, res) => {
  try {
    const { userId, productId } = req.body;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'Kullanıcı bulunamadı.' });
    }

    user.stocks = user.stocks.filter(stock => stock.productId.toString() !== productId);
    await user.save();
    res.json({ message: 'Ürün stoktan silindi.' });
  } catch (err) {
    res.status(500).json({ error: 'Bir hata oluştu.' });
  }
});

/**
 * @swagger
 * /api/users/profile/{userId}:
 *   get:
 *     summary: Kullanıcı profil bilgileri
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Kullanıcı bilgileri
 *       404:
 *         description: Kullanıcı bulunamadı
 */
router.get('/profile/:userId', 
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ error: 'Kullanıcı bulunamadı.' });
    }
    res.json({
      _id: user._id,
      email: user.email,
      username: user.username,
      phone: user.phone,
      birthDate: user.birthDate,
      gender: user.gender,
      address: user.address,
      twoFactorEnabled: user.twoFactorEnabled,
      passwordStrength: user.passwordStrength,
      lastPasswordChange: user.lastPasswordChange,
      notifications: user.notifications,
      privacy: user.privacy,
      stocks: user.stocks
    });
  })
);

// Eski route'u da tutalım (geriye uyumluluk için)
router.get('/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ error: 'Kullanıcı bulunamadı.' });
    }
    res.json({
      _id: user._id,
      email: user.email,
      username: user.username,
      stocks: user.stocks
    });
  } catch (err) {
    res.status(500).json({ error: 'Bir hata oluştu.' });
  }
});

module.exports = router;
