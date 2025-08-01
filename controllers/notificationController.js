const User = require('../models/user');
const Product = require('../models/Product');
const { sendEmail, sendBulkEmail } = require('../utils/emailService');
const { asyncHandler } = require('../middleware/errorHandler');
const log = require('../utils/logger');

// Yeni ürün eklendiğinde tüm kullanıcılara bildirim gönder
const notifyNewProduct = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  
  const product = await Product.findById(productId);
  if (!product) {
    return res.status(404).json({ message: 'Ürün bulunamadı' });
  }

  // Tüm kullanıcıları al (e-posta bildirimlerini açık olanlar)
  const users = await User.find({
    'notifications.emailNotifications': true,
    email: { $exists: true, $ne: '' }
  });

  if (users.length === 0) {
    return res.json({ message: 'Bildirim gönderilecek kullanıcı bulunamadı' });
  }

  const recipients = users.map(user => ({
    email: user.email,
    username: user.username
  }));

  // Toplu e-posta gönder
  const results = await sendBulkEmail(recipients, 'newProduct', {
    productName: product.name,
    productPrice: product.price
  });

  const successCount = results.filter(r => r.result.success).length;
  const failCount = results.length - successCount;

  log.info('Yeni ürün bildirimi gönderildi', {
    productId,
    totalRecipients: recipients.length,
    successCount,
    failCount
  });

  res.json({
    message: 'Bildirimler gönderildi',
    totalRecipients: recipients.length,
    successCount,
    failCount
  });
});

// Fiyat düşüşü bildirimi gönder
const notifyPriceDrop = asyncHandler(async (req, res) => {
  const { productId, oldPrice, newPrice } = req.body;
  
  const product = await Product.findById(productId);
  if (!product) {
    return res.status(404).json({ message: 'Ürün bulunamadı' });
  }

  // Bu ürünü favorilerinde bulunduran kullanıcıları al
  const users = await User.find({
    favorites: productId,
    'notifications.priceAlerts': true,
    email: { $exists: true, $ne: '' }
  });

  if (users.length === 0) {
    return res.json({ message: 'Fiyat düşüşü bildirimi gönderilecek kullanıcı bulunamadı' });
  }

  const recipients = users.map(user => ({
    email: user.email,
    username: user.username
  }));

  // Toplu e-posta gönder
  const results = await sendBulkEmail(recipients, 'priceDrop', {
    productName: product.name,
    oldPrice,
    newPrice
  });

  const successCount = results.filter(r => r.result.success).length;
  const failCount = results.length - successCount;

  log.info('Fiyat düşüşü bildirimi gönderildi', {
    productId,
    oldPrice,
    newPrice,
    totalRecipients: recipients.length,
    successCount,
    failCount
  });

  res.json({
    message: 'Fiyat düşüşü bildirimleri gönderildi',
    totalRecipients: recipients.length,
    successCount,
    failCount
  });
});

// Kullanıcının bildirim tercihlerini güncelle
const updateNotificationPreferences = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { notifications } = req.body;

  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
  }

  user.notifications = {
    ...user.notifications,
    ...notifications
  };

  await user.save();

  log.user('notificationPreferencesUpdated', userId, { notifications });

  res.json({
    message: 'Bildirim tercihleri güncellendi',
    notifications: user.notifications
  });
});

// Test e-postası gönder
const sendTestEmail = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { template } = req.body;

  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
  }

  if (!user.email) {
    return res.status(400).json({ message: 'Kullanıcının e-posta adresi yok' });
  }

  let testData = {};
  
  // Template'e göre test verisi oluştur
  switch (template) {
    case 'welcome':
      testData = { username: user.username };
      break;
    case 'newProduct':
      testData = { productName: 'Test Ürün', productPrice: '99.99' };
      break;
    case 'gamificationAchievement':
      testData = { 
        achievement: {
          name: 'Test Rozeti',
          description: 'Bu bir test rozetidir',
          icon: '🏆'
        }
      };
      break;
    case 'levelUp':
      testData = { newLevel: 'Silver' };
      break;
    case 'priceDrop':
      testData = { productName: 'Test Ürün', oldPrice: '150', newPrice: '120' };
      break;
    default:
      return res.status(400).json({ message: 'Geçersiz template' });
  }

  const result = await sendEmail(user.email, template, { username: user.username, ...testData });

  if (result.success) {
    res.json({
      message: 'Test e-postası gönderildi',
      messageId: result.messageId
    });
  } else {
    res.status(500).json({
      message: 'Test e-postası gönderilemedi',
      error: result.error
    });
  }
});

module.exports = {
  notifyNewProduct,
  notifyPriceDrop,
  updateNotificationPreferences,
  sendTestEmail
}; 