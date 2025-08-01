const express = require('express');
const router = express.Router();
const { 
  notifyNewProduct, 
  notifyPriceDrop, 
  updateNotificationPreferences, 
  sendTestEmail 
} = require('../controllers/notificationController');
const { asyncHandler } = require('../middleware/errorHandler');
const { sanitizeInput } = require('../middleware/validation');

/**
 * @swagger
 * /api/notifications/new-product/{productId}:
 *   post:
 *     summary: Yeni ürün bildirimi gönder
 *     tags: [Notifications]
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: Ürün ID
 *     responses:
 *       200:
 *         description: Bildirimler başarıyla gönderildi
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 totalRecipients:
 *                   type: number
 *                 successCount:
 *                   type: number
 *                 failCount:
 *                   type: number
 */
router.post('/new-product/:productId', sanitizeInput, asyncHandler(notifyNewProduct));

/**
 * @swagger
 * /api/notifications/price-drop:
 *   post:
 *     summary: Fiyat düşüşü bildirimi gönder
 *     tags: [Notifications]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productId
 *               - oldPrice
 *               - newPrice
 *             properties:
 *               productId:
 *                 type: string
 *               oldPrice:
 *                 type: number
 *               newPrice:
 *                 type: number
 *     responses:
 *       200:
 *         description: Fiyat düşüşü bildirimleri gönderildi
 */
router.post('/price-drop', sanitizeInput, asyncHandler(notifyPriceDrop));

/**
 * @swagger
 * /api/notifications/preferences/{userId}:
 *   put:
 *     summary: Kullanıcının bildirim tercihlerini güncelle
 *     tags: [Notifications]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: Kullanıcı ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               notifications:
 *                 type: object
 *                 properties:
 *                   emailNotifications:
 *                     type: boolean
 *                   priceAlerts:
 *                     type: boolean
 *                   gamificationUpdates:
 *                     type: boolean
 *                   marketingEmails:
 *                     type: boolean
 *     responses:
 *       200:
 *         description: Bildirim tercihleri güncellendi
 */
router.put('/preferences/:userId', sanitizeInput, asyncHandler(updateNotificationPreferences));

/**
 * @swagger
 * /api/notifications/test/{userId}:
 *   post:
 *     summary: Test e-postası gönder
 *     tags: [Notifications]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: Kullanıcı ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - template
 *             properties:
 *               template:
 *                 type: string
 *                 enum: [welcome, newProduct, gamificationAchievement, levelUp, priceDrop]
 *     responses:
 *       200:
 *         description: Test e-postası gönderildi
 */
router.post('/test/:userId', sanitizeInput, asyncHandler(sendTestEmail));

module.exports = router; 