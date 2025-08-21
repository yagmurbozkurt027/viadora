const express = require('express');
const router = express.Router();
const WholesaleCustomer = require('../models/WholesaleCustomer');
const Product = require('../models/Product');
const authMiddleware = require('../middlewares/authMiddleware');
const isAdmin = require('../middlewares/isAdmin');

// Toptan müşteri kaydı
router.post('/customers', authMiddleware, async (req, res) => {
  try {
    const wholesaleCustomer = new WholesaleCustomer({
      userId: req.user._id,
      ...req.body
    });
    await wholesaleCustomer.save();
    res.status(201).json({
      success: true,
      message: 'Toptan müşteri kaydı başarılı!',
      customer: wholesaleCustomer
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Toptan müşteri bilgilerini getir
router.get('/customers/:id', authMiddleware, async (req, res) => {
  try {
    const customer = await WholesaleCustomer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ error: 'Müşteri bulunamadı' });
    }
    res.json(customer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Kullanıcının toptan müşteri durumunu kontrol et
router.get('/my-status', authMiddleware, async (req, res) => {
  try {
    const customer = await WholesaleCustomer.findOne({ userId: req.user._id });
    res.json({
      isWholesale: !!customer,
      status: customer ? customer.status : 'none',
      customer: customer
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin: Tüm toptan müşterileri listele
router.get('/customers', authMiddleware, isAdmin, async (req, res) => {
  try {
    const customers = await WholesaleCustomer.find().populate('userId', 'username email');
    res.json(customers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin: Toptan müşteri onayla/reddet
router.patch('/customers/:id/status', authMiddleware, isAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    const customer = await WholesaleCustomer.findByIdAndUpdate(
      req.params.id,
      { 
        status,
        approvedBy: req.user._id,
        approvedAt: new Date()
      },
      { new: true }
    );
    res.json({
      success: true,
      message: `Müşteri durumu ${status} olarak güncellendi`,
      customer
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Toptan fiyatları getir
router.get('/pricing', authMiddleware, async (req, res) => {
  try {
    const products = await Product.find({ 
      'wholesalePricing.wholesale': { $gt: 0 } 
    }).select('name wholesalePricing category season');
    
    res.json({
      success: true,
      products: products
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
