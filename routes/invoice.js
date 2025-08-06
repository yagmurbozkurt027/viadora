const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoiceController');
const auth = require('../middlewares/authMiddleware');

// Yeni fatura oluşturma
router.post('/', auth, invoiceController.createInvoice);

// Fatura listesi
router.get('/', auth, invoiceController.getInvoices);

// Fatura detayı
router.get('/:id', auth, invoiceController.getInvoiceById);

// Fatura güncelleme
router.put('/:id', auth, invoiceController.updateInvoice);

// Fatura silme
router.delete('/:id', auth, invoiceController.deleteInvoice);

// Fatura PDF indirme
router.get('/:id/pdf', auth, invoiceController.downloadInvoicePDF);

// Fatura raporu
router.get('/report/summary', auth, invoiceController.getInvoiceReport);

module.exports = router; 