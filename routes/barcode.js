const express = require('express');
const router = express.Router();
const barcodeController = require('../controllers/barcodeController');
const auth = require('../middlewares/authMiddleware');

// Barkod ile ürün arama
router.get('/search/:barcode', auth, barcodeController.searchByBarcode);

// Çoklu barkod ile ürün arama
router.post('/search-multiple', auth, barcodeController.searchMultipleBarcodes);

// Ürüne barkod ekleme
router.post('/', auth, barcodeController.addBarcodeToProduct);

// Barkod güncelleme
router.put('/product/:productId/:barcodeId', auth, barcodeController.updateBarcode);

// Barkod silme
router.delete('/:barcodeCode', auth, barcodeController.deleteBarcode);

// Barkod tarama geçmişi
router.get('/history/:barcode', auth, barcodeController.getBarcodeScanHistory);

// Barkod raporu
router.get('/report', auth, barcodeController.getBarcodeReport);

module.exports = router; 