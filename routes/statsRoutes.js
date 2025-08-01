const express = require('express');
const router = express.Router();
const User = require('../models/user');
const Product = require('../models/Product');
const Order = require('../models/Order');
const { asyncHandler } = require('../middleware/errorHandler');
const log = require('../utils/logger');

/**
 * @swagger
 * /api/stats:
 *   get:
 *     summary: Sistem istatistiklerini getir
 *     tags: [Stats]
 *     responses:
 *       200:
 *         description: İstatistikler başarıyla getirildi
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalSales:
 *                   type: number
 *                   description: Toplam satış tutarı
 *                 totalOrders:
 *                   type: number
 *                   description: Toplam sipariş sayısı
 *                 totalUsers:
 *                   type: number
 *                   description: Toplam kullanıcı sayısı
 *                 totalProducts:
 *                   type: number
 *                   description: Toplam ürün sayısı
 */
router.get('/', 
  asyncHandler(async (req, res) => {
    try {
      // Kullanıcı sayısı
      const totalUsers = await User.countDocuments();
      
      // Ürün sayısı
      const totalProducts = await Product.countDocuments();
      
      // Sipariş sayısı (Order modeli varsa)
      let totalOrders = 0;
      let totalSales = 0;
      
      try {
        totalOrders = await Order.countDocuments();
        // Toplam satış tutarını hesapla
        const orders = await Order.find();
        totalSales = orders.reduce((sum, order) => sum + (order.total || 0), 0);
      } catch (err) {
        // Order modeli yoksa varsayılan değerler
        totalOrders = 0;
        totalSales = 0;
      }

      const stats = {
        totalSales,
        totalOrders,
        totalUsers,
        totalProducts
      };

      log.info('Stats retrieved', { stats });
      res.json(stats);
    } catch (err) {
      log.error('Stats retrieval failed', { error: err.message });
      res.status(500).json({ error: 'İstatistikler alınırken hata oluştu' });
    }
  })
);

/**
 * @swagger
 * /api/stats/sales:
 *   get:
 *     summary: Satış verilerini getir
 *     tags: [Stats]
 *     responses:
 *       200:
 *         description: Satış verileri başarıyla getirildi
 */
router.get('/sales', 
  asyncHandler(async (req, res) => {
    try {
      // Örnek satış verileri (gerçek verilerle değiştirilecek)
      const salesData = {
        monthly: [
          { month: 'Ocak', sales: 12000 },
          { month: 'Şubat', sales: 19000 },
          { month: 'Mart', sales: 15000 },
          { month: 'Nisan', sales: 25000 },
          { month: 'Mayıs', sales: 22000 },
          { month: 'Haziran', sales: 30000 }
        ],
        categories: [
          { category: 'Elektronik', sales: 300 },
          { category: 'Giyim', sales: 250 },
          { category: 'Ev & Yaşam', sales: 180 },
          { category: 'Spor', sales: 120 },
          { category: 'Kitap', sales: 90 }
        ]
      };

      res.json(salesData);
    } catch (err) {
      log.error('Sales data retrieval failed', { error: err.message });
      res.status(500).json({ error: 'Satış verileri alınırken hata oluştu' });
    }
  })
);

/**
 * @swagger
 * /api/stats/users:
 *   get:
 *     summary: Kullanıcı istatistiklerini getir
 *     tags: [Stats]
 *     responses:
 *       200:
 *         description: Kullanıcı istatistikleri başarıyla getirildi
 */
router.get('/users', 
  asyncHandler(async (req, res) => {
    try {
      const totalUsers = await User.countDocuments();
      
      // Son 30 günde kayıt olan kullanıcılar
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const newUsers = await User.countDocuments({
        createdAt: { $gte: thirtyDaysAgo }
      });

      const userStats = {
        total: totalUsers,
        new: newUsers,
        active: Math.floor(totalUsers * 0.65), // Örnek: %65 aktif
        inactive: Math.floor(totalUsers * 0.35) // Örnek: %35 pasif
      };

      res.json(userStats);
    } catch (err) {
      log.error('User stats retrieval failed', { error: err.message });
      res.status(500).json({ error: 'Kullanıcı istatistikleri alınırken hata oluştu' });
    }
  })
);

module.exports = router; 