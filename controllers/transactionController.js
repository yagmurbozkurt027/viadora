const Transaction = require('../models/Transaction');
const TransactionItem = require('../models/TransactionItem');
const PDFDocument = require('pdfkit');
const nodemailer = require('nodemailer');
const stream = require('stream');

// Yeni işlem (fiş) oluştur
exports.createTransaction = async (req, res) => {
  try {
    const { type, user, description, storeName, items } = req.body;
    let total = 0;
    const transactionItems = await Promise.all(items.map(async (item) => {
      const totalPrice = item.quantity * item.unitPrice;
      total += totalPrice;
      const transactionItem = new TransactionItem({
        productName: item.productName,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice
      });
      await transactionItem.save();
      return transactionItem;
    }));
    const transaction = new Transaction({
      type,
      user,
      description,
      storeName,
      total,
      items: transactionItems.map(i => i._id)
    });
    await transaction.save();
    // TransactionItem'lara transaction referansı ekle
    await Promise.all(transactionItems.map(async (item) => {
      item.transaction = transaction._id;
      await item.save();
    }));
    res.status(201).json(transaction);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Fiş detayını getir
exports.getTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id).populate('items');
    if (!transaction) return res.status(404).json({ error: 'Fiş bulunamadı' });
    res.json(transaction);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Tüm fişleri getir
exports.getAllTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find().populate('items');
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Fişi PDF olarak oluşturup e-posta ile gönder
exports.sendTransactionPdf = async (req, res) => {
  try {
    const { email } = req.body;
    const transaction = await Transaction.findById(req.params.id).populate('items');
    if (!transaction) return res.status(404).json({ error: 'Fiş bulunamadı' });
    // PDF oluştur
    const doc = new PDFDocument();
    let buffers = [];
    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', async () => {
      const pdfData = Buffer.concat(buffers);
      // Nodemailer ile e-posta gönder
      let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'GMAIL_ADRESINIZ', // Buraya kendi gmail adresinizi yazın
          pass: 'UYGULAMA_SIFRESI' // Gmail uygulama şifresi kullanın
        }
      });
      let mailOptions = {
        from: 'GMAIL_ADRESINIZ',
        to: email,
        subject: 'Ürün İşlem Fişi',
        text: 'Fişiniz ektedir.',
        attachments: [{ filename: 'fis.pdf', content: pdfData }]
      };
      try {
        await transporter.sendMail(mailOptions);
        res.json({ message: 'PDF e-posta ile gönderildi!' });
      } catch (err) {
        res.status(500).json({ error: 'E-posta gönderilemedi: ' + err.message });
      }
    });
    // PDF içeriği
    doc.fontSize(18).text(transaction.storeName || 'Mağaza', { align: 'center' });
    doc.moveDown();
    doc.fontSize(14).text('Ürün İşlem Fişi', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text('Tarih: ' + new Date(transaction.date).toLocaleString());
    doc.text('İşlem Tipi: ' + transaction.type);
    doc.moveDown();
    doc.text('Ürünler:');
    transaction.items.forEach((item, i) => {
      doc.text(`${i + 1}. ${item.productName}  ${item.quantity} x ${item.unitPrice.toFixed(2)}₺ = ${(item.totalPrice).toFixed(2)}₺`);
    });
    doc.moveDown();
    doc.text('GENEL TOPLAM: ' + transaction.total.toFixed(2) + '₺', { bold: true });
    doc.text('İşlemi Yapan: ' + (transaction.user || '-'));
    if (transaction.description) doc.text('Açıklama: ' + transaction.description);
    doc.end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}; 