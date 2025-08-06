const express = require('express');
const router = express.Router();
const goodsReceiptController = require('../controllers/goodsReceiptController');
const auth = require('../middlewares/authMiddleware');

// Yeni mal kabul oluşturma
router.post('/', auth, goodsReceiptController.createGoodsReceipt);

// Mal kabul listesi
router.get('/', auth, goodsReceiptController.getGoodsReceipts);

// Mal kabul detayı
router.get('/:id', auth, goodsReceiptController.getGoodsReceiptById);

// Mal kabul güncelleme
router.put('/:id', auth, goodsReceiptController.updateGoodsReceipt);

// Barkod tarama
router.post('/:receiptId/scan', auth, goodsReceiptController.scanBarcode);

// Kalite kontrol güncelleme
router.put('/:receiptId/quality/:itemIndex', auth, goodsReceiptController.updateQualityControl);

// Mal kabul onaylama
router.post('/:id/approve', auth, goodsReceiptController.approveGoodsReceipt);

// Mal kabul raporu
router.get('/report/summary', auth, goodsReceiptController.getGoodsReceiptReport);

module.exports = router; 