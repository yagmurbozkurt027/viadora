const Invoice = require('../models/Invoice');
const Product = require('../models/Product');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

// Fatura numarası oluşturma
const generateInvoiceNumber = async (type) => {
  const prefix = {
    'Satış Faturası': 'SF',
    'İthal Faturası': 'IF',
    'İrsaliye': 'IR',
    'Tanıtım': 'TF'
  }[type] || 'FA';

  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  
  const count = await Invoice.countDocuments({
    invoiceType: type,
    createdAt: {
      $gte: new Date(year, date.getMonth(), 1),
      $lt: new Date(year, date.getMonth() + 1, 1)
    }
  });

  return `${prefix}${year}${month}${String(count + 1).padStart(4, '0')}`;
};

// Yeni fatura oluşturma
const createInvoice = async (req, res) => {
  try {
    const {
      invoiceType,
      customer,
      supplier,
      items,
      paymentMethod,
      notes,
      deliveryNote,
      importData,
      promotion
    } = req.body;

    if (!invoiceType || !items || items.length === 0) {
      return res.status(400).json({ error: 'Fatura tipi ve ürünler gerekli' });
    }

    // Fatura numarası oluştur
    const invoiceNumber = await generateInvoiceNumber(invoiceType);

    // Toplam hesaplama
    let subtotal = 0;
    let taxAmount = 0;
    let discountAmount = 0;

    const processedItems = items.map(item => {
      const itemTotal = item.quantity * item.unitPrice;
      const itemDiscount = (item.discount || 0) * item.quantity;
      const itemTax = ((itemTotal - itemDiscount) * (item.taxRate || 18)) / 100;

      subtotal += itemTotal;
      discountAmount += itemDiscount;
      taxAmount += itemTax;

      return {
        ...item,
        totalPrice: itemTotal - itemDiscount + itemTax
      };
    });

    const totalAmount = subtotal - discountAmount + taxAmount;

    const invoice = new Invoice({
      invoiceNumber,
      invoiceType,
      customer,
      supplier,
      items: processedItems,
      subtotal,
      taxAmount,
      discountAmount,
      totalAmount,
      paymentMethod,
      notes,
      deliveryNote,
      importData,
      promotion,
      createdBy: req.user.id
    });

    await invoice.save();

    // PDF oluştur
    const pdfPath = await generateInvoicePDF(invoice);

    invoice.pdfPath = pdfPath;
    await invoice.save();

    res.json({
      success: true,
      message: 'Fatura başarıyla oluşturuldu',
      invoice: invoice
    });
  } catch (error) {
    console.error('Fatura oluşturma hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
};

// Fatura listesi
const getInvoices = async (req, res) => {
  try {
    const { type, status, startDate, endDate, page = 1, limit = 20 } = req.query;

    let query = {};
    
    if (type) query.invoiceType = type;
    if (status) query.status = status;
    if (startDate && endDate) {
      query.invoiceDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const skip = (page - 1) * limit;

    const invoices = await Invoice.find(query)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Invoice.countDocuments(query);

    res.json({
      success: true,
      invoices: invoices,
      total: total,
      page: parseInt(page),
      limit: parseInt(limit)
    });
  } catch (error) {
    console.error('Fatura listesi hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
};

// Fatura detayı
const getInvoiceById = async (req, res) => {
  try {
    const { id } = req.params;

    const invoice = await Invoice.findById(id)
      .populate('createdBy', 'name email')
      .populate('items.productId');

    if (!invoice) {
      return res.status(404).json({ error: 'Fatura bulunamadı' });
    }

    res.json({
      success: true,
      invoice: invoice
    });
  } catch (error) {
    console.error('Fatura detayı hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
};

// Fatura güncelleme
const updateInvoice = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const invoice = await Invoice.findById(id);
    if (!invoice) {
      return res.status(404).json({ error: 'Fatura bulunamadı' });
    }

    // Sadece belirli alanların güncellenmesine izin ver
    const allowedUpdates = [
      'status', 'paymentStatus', 'paidAmount', 'notes', 
      'deliveryNote', 'import', 'promotion'
    ];

    allowedUpdates.forEach(field => {
      if (updateData[field] !== undefined) {
        invoice[field] = updateData[field];
      }
    });

    await invoice.save();

    res.json({
      success: true,
      message: 'Fatura başarıyla güncellendi',
      invoice: invoice
    });
  } catch (error) {
    console.error('Fatura güncelleme hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
};

// Fatura silme
const deleteInvoice = async (req, res) => {
  try {
    const { id } = req.params;

    const invoice = await Invoice.findById(id);
    if (!invoice) {
      return res.status(404).json({ error: 'Fatura bulunamadı' });
    }

    // PDF dosyasını sil
    if (invoice.pdfPath && fs.existsSync(invoice.pdfPath)) {
      fs.unlinkSync(invoice.pdfPath);
    }

    await Invoice.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Fatura başarıyla silindi'
    });
  } catch (error) {
    console.error('Fatura silme hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
};

// PDF oluşturma
const generateInvoicePDF = async (invoice) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const fileName = `invoice_${invoice.invoiceNumber}_${Date.now()}.pdf`;
      const filePath = path.join(__dirname, '../uploads/invoices', fileName);

      // Dizin yoksa oluştur
      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);

      // Başlık
      doc.fontSize(20).text('FATURA', { align: 'center' });
      doc.moveDown();
      doc.fontSize(12).text(`Fatura No: ${invoice.invoiceNumber}`);
      doc.text(`Tarih: ${new Date(invoice.invoiceDate).toLocaleDateString('tr-TR')}`);
      doc.text(`Tip: ${invoice.invoiceType}`);
      doc.moveDown();

      // Müşteri/Tedarikçi bilgileri
      if (invoice.customer) {
        doc.fontSize(14).text('MÜŞTERİ BİLGİLERİ');
        doc.fontSize(10).text(`Ad: ${invoice.customer.name}`);
        if (invoice.customer.taxNumber) doc.text(`Vergi No: ${invoice.customer.taxNumber}`);
        if (invoice.customer.address) doc.text(`Adres: ${invoice.customer.address}`);
        doc.moveDown();
      }

      if (invoice.supplier && invoice.supplier.name) {
        doc.fontSize(14).text('TEDARİKÇİ BİLGİLERİ');
        doc.fontSize(10).text(`Ad: ${invoice.supplier.name}`);
        if (invoice.supplier.taxNumber) doc.text(`Vergi No: ${invoice.supplier.taxNumber}`);
        if (invoice.supplier.address) doc.text(`Adres: ${invoice.supplier.address}`);
        doc.moveDown();
      }

      // Ürün tablosu
      doc.fontSize(14).text('ÜRÜNLER');
      doc.moveDown();

      // Tablo başlığı
      const tableTop = doc.y;
      doc.fontSize(10);
      doc.text('Ürün', 50, tableTop);
      doc.text('Miktar', 200, tableTop);
      doc.text('Birim Fiyat', 280, tableTop);
      doc.text('Toplam', 380, tableTop);

      // Ürünler
      let y = tableTop + 20;
      invoice.items.forEach(item => {
        doc.text(item.name, 50, y);
        doc.text(item.quantity.toString(), 200, y);
        doc.text(item.unitPrice.toFixed(2) + ' TL', 280, y);
        doc.text(item.totalPrice.toFixed(2) + ' TL', 380, y);
        y += 15;
      });

      doc.moveDown(2);

      // Toplamlar
      doc.text(`Ara Toplam: ${invoice.subtotal.toFixed(2)} TL`, { align: 'right' });
      doc.text(`KDV: ${invoice.taxAmount.toFixed(2)} TL`, { align: 'right' });
      if (invoice.discountAmount > 0) {
        doc.text(`İndirim: -${invoice.discountAmount.toFixed(2)} TL`, { align: 'right' });
      }
      doc.fontSize(12).text(`GENEL TOPLAM: ${invoice.totalAmount.toFixed(2)} TL`, { align: 'right' });

      doc.end();

      stream.on('finish', () => {
        resolve(filePath);
      });

      stream.on('error', reject);
    } catch (error) {
      reject(error);
    }
  });
};

// Fatura PDF indirme
const downloadInvoicePDF = async (req, res) => {
  try {
    const { id } = req.params;

    const invoice = await Invoice.findById(id);
    if (!invoice) {
      return res.status(404).json({ error: 'Fatura bulunamadı' });
    }

    if (!invoice.pdfPath || !fs.existsSync(invoice.pdfPath)) {
      // PDF yoksa yeniden oluştur
      const pdfPath = await generateInvoicePDF(invoice);
      invoice.pdfPath = pdfPath;
      await invoice.save();
    }

    res.download(invoice.pdfPath, `fatura_${invoice.invoiceNumber}.pdf`);
  } catch (error) {
    console.error('PDF indirme hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
};

// Fatura raporu
const getInvoiceReport = async (req, res) => {
  try {
    const { startDate, endDate, type } = req.query;

    let matchQuery = {};
    if (startDate && endDate) {
      matchQuery.invoiceDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    if (type) matchQuery.invoiceType = type;

    const report = await Invoice.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$invoiceType',
          count: { $sum: 1 },
          totalAmount: { $sum: '$totalAmount' },
          avgAmount: { $avg: '$totalAmount' }
        }
      },
      { $sort: { totalAmount: -1 } }
    ]);

    res.json({
      success: true,
      report: report
    });
  } catch (error) {
    console.error('Fatura raporu hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
};

module.exports = {
  createInvoice,
  getInvoices,
  getInvoiceById,
  updateInvoice,
  deleteInvoice,
  downloadInvoicePDF,
  getInvoiceReport
}; 