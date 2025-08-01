const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const speakeasy = require('speakeasy');
const { sendEmail } = require('../utils/emailService');

const registerUser = async (req, res) => {
  try {
    const { username, email, password, isAdmin } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ error: "Tüm alanlar zorunludur." });
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Bu email zaten kayıtlı." });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const passwordStrength = calculatePasswordStrength(password);
    
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      passwordStrength,
      isAdmin: isAdmin || false
    });
    await newUser.save();
    
    try {
      await sendEmail(email, 'welcome', { username });
    } catch (emailError) {
      console.error('Hoş geldin e-postası gönderilemedi:', emailError);
    }
    
    res.status(201).json({ message: "Kayıt başarılı" });
  } catch (err) {
    res.status(500).json({ error: "Sunucu hatası" });
  }
};

const loginUser = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(401).json({ error: "Geçersiz kimlik bilgileri." });
    }
    const isMatch = await bcrypt.compare(req.body.password, user.password);
    if (!isMatch) {
          await logLoginAttempt(user._id, req, false);
    return res.status(401).json({ error: "Geçersiz kimlik bilgileri." });
  }

  await logLoginAttempt(user._id, req, true);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const lastLoginDate = user.gamification.statistics.lastLoginDate;
  const lastLoginDay = lastLoginDate ? new Date(lastLoginDate) : null;
  lastLoginDay?.setHours(0, 0, 0, 0);

  if (!lastLoginDay || lastLoginDay.getTime() !== today.getTime()) {
    user.gamification.points += 10;
    user.gamification.experience += 10;
    user.gamification.statistics.totalPointsEarned += 10;
    
    if (lastLoginDay && (today.getTime() - lastLoginDay.getTime()) === 86400000) {
      user.gamification.statistics.loginStreak += 1;
    } else if (!lastLoginDay || (today.getTime() - lastLoginDay.getTime()) > 86400000) {
      user.gamification.statistics.loginStreak = 1;
    }
    
    user.gamification.statistics.lastLoginDate = new Date();
  }

  const loginTask = user.gamification.dailyTasks.find(task => task.id === 'login');
  if (loginTask && !loginTask.completed) {
    loginTask.progress = 1;
    if (loginTask.progress >= loginTask.maxProgress) {
      loginTask.completed = true;
      user.gamification.points += loginTask.reward;
      user.gamification.experience += loginTask.reward;
      user.gamification.statistics.totalPointsEarned += loginTask.reward;
      user.gamification.statistics.tasksCompleted += 1;
    }
  }

    await user.save();

    const token = jwt.sign(
      {
        _id: user._id,
        email: user.email,
        username: user.username,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
    res.json({
      token,
      user: {
        _id: user._id,
        email: user.email,
        username: user.username,
        isAdmin: user.isAdmin,
        role: user.isAdmin ? 'admin' : 'user'
      }
    });
  } catch (err) {
    res.status(500).json({ error: "Sunucu hatası" });
  }
};

// Kullanıcı profilini güncelle
const updateUserProfile = async (req, res) => {
  try {
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
    
    if (!userId || !username || !email) {
      return res.status(400).json({ error: "Kullanıcı ID, kullanıcı adı ve e-posta zorunludur." });
    }

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
  } catch (err) {
    res.status(500).json({ error: "Sunucu hatası" });
  }
};

// İki faktörlü doğrulama kurulumu
const setup2FA = async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "Kullanıcı bulunamadı." });
    }

    // Yeni secret oluştur
    const secret = speakeasy.generateSecret({
      name: `Butik Proje (${user.email})`
    });

    user.twoFactorSecret = secret.base32;
    await user.save();

    res.json({
      secret: secret.base32,
      qrCode: secret.otpauth_url
    });
  } catch (err) {
    res.status(500).json({ error: "Sunucu hatası" });
  }
};

// İki faktörlü doğrulama doğrula
const verify2FA = async (req, res) => {
  try {
    const { userId, token } = req.body;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "Kullanıcı bulunamadı." });
    }

    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token: token
    });

    if (verified) {
      user.twoFactorEnabled = true;
      await user.save();
      res.json({ success: true, message: "2FA başarıyla etkinleştirildi." });
    } else {
      res.status(400).json({ error: "Geçersiz kod." });
    }
  } catch (err) {
    res.status(500).json({ error: "Sunucu hatası" });
  }
};

// Giriş geçmişini getir
const getLoginHistory = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "Kullanıcı bulunamadı." });
    }

    res.json({
      loginHistory: user.loginHistory.slice(-10) // Son 10 giriş
    });
  } catch (err) {
    res.status(500).json({ error: "Sunucu hatası" });
  }
};

// Şifre gücünü kontrol et
const checkPasswordStrength = async (req, res) => {
  try {
    const { password } = req.body;
    const strength = calculatePasswordStrength(password);
    
    res.json({
      strength,
      feedback: getPasswordFeedback(strength)
    });
  } catch (err) {
    res.status(500).json({ error: "Sunucu hatası" });
  }
};

// Yardımcı fonksiyonlar
const calculatePasswordStrength = (password) => {
  let strength = 0;
  
  if (password.length >= 8) strength += 20;
  if (password.length >= 12) strength += 10;
  if (/[a-z]/.test(password)) strength += 20;
  if (/[A-Z]/.test(password)) strength += 20;
  if (/[0-9]/.test(password)) strength += 20;
  if (/[^A-Za-z0-9]/.test(password)) strength += 10;
  
  return Math.min(strength, 100);
};

const getPasswordFeedback = (strength) => {
  if (strength < 40) return "Çok zayıf";
  if (strength < 60) return "Zayıf";
  if (strength < 80) return "Orta";
  if (strength < 90) return "Güçlü";
  return "Çok güçlü";
};

const logLoginAttempt = async (userId, req, success) => {
  try {
    const user = await User.findById(userId);
    if (!user) return;

    const loginRecord = {
      device: req.headers['user-agent'] || 'Bilinmeyen',
      browser: getBrowserInfo(req.headers['user-agent']),
      ip: req.ip || req.connection.remoteAddress,
      location: 'Türkiye', // Gerçek uygulamada IP'den lokasyon çekilir
      timestamp: new Date(),
      success
    };

    user.loginHistory.push(loginRecord);
    
    // Son 50 girişi tut
    if (user.loginHistory.length > 50) {
      user.loginHistory = user.loginHistory.slice(-50);
    }
    
    await user.save();
  } catch (err) {
    console.error('Giriş kaydı hatası:', err);
  }
};

const getBrowserInfo = (userAgent) => {
  if (!userAgent) return 'Bilinmeyen';
  if (userAgent.includes('Chrome')) return 'Chrome';
  if (userAgent.includes('Firefox')) return 'Firefox';
  if (userAgent.includes('Safari')) return 'Safari';
  if (userAgent.includes('Edge')) return 'Edge';
  return 'Diğer';
};

// Kullanıcının stoklarından ürün silme
const removeUserStock = async (req, res) => {
  try {
    const { userId, productId } = req.body;
    if (!userId || !productId) {
      return res.status(400).json({ error: 'userId ve productId zorunludur.' });
    }
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'Kullanıcı bulunamadı.' });
    }
    // Stoklardan ürünü çıkar
    user.stocks = user.stocks.filter(s => s.productId.toString() !== productId);
    await user.save();
    res.json({ success: true, stocks: user.stocks });
  } catch (err) {
    res.status(500).json({ error: 'Bir hata oluştu.' });
  }
};

// Favori ürün ekle/çıkar
const toggleFavorite = async (req, res) => {
  try {
    const { userId, productId } = req.body;
    
    if (!userId || !productId) {
      return res.status(400).json({ error: "Kullanıcı ID ve ürün ID zorunludur." });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "Kullanıcı bulunamadı." });
    }

    // Favori ürünleri kontrol et
    const favorites = user.favorites || [];
    const isFavorite = favorites.includes(productId);
    
    if (isFavorite) {
      // Favorilerden çıkar
      user.favorites = favorites.filter(id => id.toString() !== productId);
      user.gamification.statistics.favoriteProducts = Math.max(0, user.gamification.statistics.favoriteProducts - 1);
    } else {
      // Favorilere ekle
      user.favorites = [...favorites, productId];
      user.gamification.statistics.favoriteProducts += 1;
      
      // Favori ekleme puanı
      user.gamification.points += 5;
      user.gamification.experience += 5;
      user.gamification.statistics.totalPointsEarned += 5;
      
      // Günlük görev güncelleme
      const favoriteTask = user.gamification.dailyTasks.find(task => task.id === 'favorite');
      if (favoriteTask && !favoriteTask.completed) {
        favoriteTask.progress += 1;
        if (favoriteTask.progress >= favoriteTask.maxProgress) {
          favoriteTask.completed = true;
          user.gamification.points += favoriteTask.reward;
          user.gamification.experience += favoriteTask.reward;
          user.gamification.statistics.totalPointsEarned += favoriteTask.reward;
          user.gamification.statistics.tasksCompleted += 1;
        }
      }
    }

    await user.save();

    res.json({
      message: isFavorite ? "Favorilerden çıkarıldı." : "Favorilere eklendi!",
      isFavorite: !isFavorite,
      favoriteCount: user.gamification.statistics.favoriteProducts,
      points: user.gamification.points
    });
  } catch (err) {
    console.error('Favori işlemi hatası:', err);
    res.status(500).json({ error: "Sunucu hatası" });
  }
};

// Kullanıcının favori ürünlerini getir
const getFavorites = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findById(userId).populate('favorites');
    if (!user) {
      return res.status(404).json({ error: "Kullanıcı bulunamadı." });
    }

    res.json({
      favorites: user.favorites || [],
      favoriteCount: user.gamification.statistics.favoriteProducts
    });
  } catch (err) {
    console.error('Favori listesi hatası:', err);
    res.status(500).json({ error: "Sunucu hatası" });
  }
};

module.exports = {
  registerUser,
  loginUser,
  updateUserProfile,
  removeUserStock,
  setup2FA,
  verify2FA,
  getLoginHistory,
  checkPasswordStrength,
  toggleFavorite,
  getFavorites
};