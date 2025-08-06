const GoodsReceipt = require('../models/GoodsReceipt');
const Product = require('../models/Product');

// Mal kabul numarası oluşturma
const generateReceiptNumber = async () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  
  const count = await GoodsReceipt.countDocuments({
    createdAt: {
      $gte: new Date(year, date.getMonth(), 1),
      $lt: new Date(year, date.getMonth() + 1, 1)
    }
  });

  return `MK${year}${month}${String(count + 1).padStart(4, '0')}`;
};

// Yeni mal kabul oluşturma
const createGoodsReceipt = async (req, res) => {
  try {
    const {
      supplier,
      deliveryNote,
      invoice,
      items,
      expectedDate,
      notes,
      importData
    } = req.body;

    if (!supplier || !deliveryNote || !items || items.length === 0) {
      return res.status(400).json({ error: 'Tedarikçi, irsaliye ve ürünler gerekli' });
    }

    // Mal kabul numarası oluştur
    const receiptNumber = await generateReceiptNumber();

    // Toplam hesaplama
    let totalItems = items.length;
    let totalQuantity = 0;
    let totalAmount = 0;

    const processedItems = items.map(item => {
      totalQuantity += item.receivedQuantity;
      totalAmount += item.totalPrice;

      return {
        ...item,
        acceptedQuantity: 0,
        rejectedQuantity: 0,
        qualityStatus: 'Beklemede'
      };
    });

    const goodsReceipt = new GoodsReceipt({
      receiptNumber,
      supplier,
      deliveryNote,
      invoice,
      items: processedItems,
      totalItems,
      totalQuantity,
      totalAmount,
      expectedDate,
      notes,
      importData,
      checkedBy: req.user.id
    });

    await goodsReceipt.save();

    res.json({
      success: true,
      message: 'Mal kabul başarıyla oluşturuldu',
      goodsReceipt: goodsReceipt
    });
  } catch (error) {
    console.error('Mal kabul oluşturma hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
};

// Mal kabul listesi
const getGoodsReceipts = async (req, res) => {
  try {
    const { status, supplier, startDate, endDate, page = 1, limit = 20 } = req.query;

    let query = {};
    
    if (status) query.status = status;
    if (supplier) query['supplier.name'] = { $regex: supplier, $options: 'i' };
    if (startDate && endDate) {
      query.receiptDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const skip = (page - 1) * limit;

    const goodsReceipts = await GoodsReceipt.find(query)
      .populate('checkedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await GoodsReceipt.countDocuments(query);

    res.json({
      success: true,
      goodsReceipts: goodsReceipts,
      total: total,
      page: parseInt(page),
      limit: parseInt(limit)
    });
  } catch (error) {
    console.error('Mal kabul listesi hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
};

// Mal kabul detayı
const getGoodsReceiptById = async (req, res) => {
  try {
    const { id } = req.params;

    const goodsReceipt = await GoodsReceipt.findById(id)
      .populate('checkedBy', 'name email')
      .populate('items.productId');

    if (!goodsReceipt) {
      return res.status(404).json({ error: 'Mal kabul bulunamadı' });
    }

    res.json({
      success: true,
      goodsReceipt: goodsReceipt
    });
  } catch (error) {
    console.error('Mal kabul detayı hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
};

// Mal kabul güncelleme
const updateGoodsReceipt = async (req, res) => {
  try {
    const { id } = req.params;
    const { items, status, notes } = req.body;

    const goodsReceipt = await GoodsReceipt.findById(id);
    if (!goodsReceipt) {
      return res.status(404).json({ error: 'Mal kabul bulunamadı' });
    }

    if (items) {
      goodsReceipt.items = items;
      
      // Toplamları yeniden hesapla
      let totalQuantity = 0;
      let totalAmount = 0;
      
      items.forEach(item => {
        totalQuantity += item.receivedQuantity;
        totalAmount += item.totalPrice;
      });
      
      goodsReceipt.totalQuantity = totalQuantity;
      goodsReceipt.totalAmount = totalAmount;
    }

    if (status) goodsReceipt.status = status;
    if (notes !== undefined) goodsReceipt.notes = notes;

    await goodsReceipt.save();

    res.json({
      success: true,
      message: 'Mal kabul başarıyla güncellendi',
      goodsReceipt: goodsReceipt
    });
  } catch (error) {
    console.error('Mal kabul güncelleme hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
};

// Barkod tarama
const scanBarcode = async (req, res) => {
  try {
    const { receiptId } = req.params;
    const { barcode } = req.body;

    if (!barcode) {
      return res.status(400).json({ error: 'Barkod gerekli' });
    }

    const goodsReceipt = await GoodsReceipt.findById(receiptId);
    if (!goodsReceipt) {
      return res.status(404).json({ error: 'Mal kabul bulunamadı' });
    }

    // Ürün arama
    const product = await Product.findOne({
      'barcodes.code': barcode
    });

    if (!product) {
      return res.status(404).json({ error: 'Ürün bulunamadı' });
    }

    // Barkod tarama geçmişine ekle
    goodsReceipt.barcodeScans.push({
      barcode: barcode,
      scannedBy: req.user.id,
      productId: product._id
    });

    await goodsReceipt.save();

    res.json({
      success: true,
      message: 'Barkod başarıyla tarandı',
      product: {
        id: product._id,
        name: product.name,
        category: product.category,
        season: product.season,
        brand: product.brand,
        color: product.color,
        sizes: product.sizes
      }
    });
  } catch (error) {
    console.error('Barkod tarama hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
};

// Kalite kontrol güncelleme
const updateQualityControl = async (req, res) => {
  try {
    const { receiptId, itemIndex } = req.params;
    const { qualityStatus, acceptedQuantity, rejectedQuantity, qualityNotes } = req.body;

    const goodsReceipt = await GoodsReceipt.findById(receiptId);
    if (!goodsReceipt) {
      return res.status(404).json({ error: 'Mal kabul bulunamadı' });
    }

    if (itemIndex < 0 || itemIndex >= goodsReceipt.items.length) {
      return res.status(400).json({ error: 'Geçersiz ürün indeksi' });
    }

    const item = goodsReceipt.items[itemIndex];
    
    if (qualityStatus) item.qualityStatus = qualityStatus;
    if (acceptedQuantity !== undefined) item.acceptedQuantity = acceptedQuantity;
    if (rejectedQuantity !== undefined) item.rejectedQuantity = rejectedQuantity;
    if (qualityNotes !== undefined) item.qualityNotes = qualityNotes;

    // Genel durum güncelleme
    const allAccepted = goodsReceipt.items.every(item => item.qualityStatus === 'Kabul');
    const allRejected = goodsReceipt.items.every(item => item.qualityStatus === 'Red');
    const hasPartial = goodsReceipt.items.some(item => item.qualityStatus === 'Kısmi Kabul');

    if (allAccepted) {
      goodsReceipt.status = 'Tam Kabul';
    } else if (allRejected) {
      goodsReceipt.status = 'Red';
    } else if (hasPartial) {
      goodsReceipt.status = 'Kısmi Kabul';
    }

    await goodsReceipt.save();

    res.json({
      success: true,
      message: 'Kalite kontrol güncellendi',
      item: item,
      status: goodsReceipt.status
    });
  } catch (error) {
    console.error('Kalite kontrol güncelleme hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
};

// Mal kabul onaylama ve stok güncelleme
const approveGoodsReceipt = async (req, res) => {
  try {
    const { id } = req.params;

    const goodsReceipt = await GoodsReceipt.findById(id);
    if (!goodsReceipt) {
      return res.status(404).json({ error: 'Mal kabul bulunamadı' });
    }

    if (goodsReceipt.status === 'Red') {
      return res.status(400).json({ error: 'Reddedilen mal kabul onaylanamaz' });
    }

    // Stok güncelleme
    for (const item of goodsReceipt.items) {
      if (item.qualityStatus === 'Kabul' || item.qualityStatus === 'Kısmi Kabul') {
        const product = await Product.findById(item.productId);
        if (product) {
          // Beden bazlı stok güncelleme
          if (item.size && product.sizes) {
            const sizeIndex = product.sizes.findIndex(s => s.name === item.size);
            if (sizeIndex !== -1) {
              product.sizes[sizeIndex].stock += item.acceptedQuantity;
            }
          } else {
            // Genel stok güncelleme
            product.stock += item.acceptedQuantity;
          }
          await product.save();
        }
      }
    }

    goodsReceipt.status = 'Tam Kabul';
    await goodsReceipt.save();

    res.json({
      success: true,
      message: 'Mal kabul onaylandı ve stoklar güncellendi',
      goodsReceipt: goodsReceipt
    });
  } catch (error) {
    console.error('Mal kabul onaylama hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
};

// Mal kabul raporu
const getGoodsReceiptReport = async (req, res) => {
  try {
    const { startDate, endDate, supplier } = req.query;

    let matchQuery = {};
    if (startDate && endDate) {
      matchQuery.receiptDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    if (supplier) matchQuery['supplier.name'] = { $regex: supplier, $options: 'i' };

    const report = await GoodsReceipt.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$totalAmount' },
          totalQuantity: { $sum: '$totalQuantity' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.json({
      success: true,
      report: report
    });
  } catch (error) {
    console.error('Mal kabul raporu hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
};

module.exports = {
  createGoodsReceipt,
  getGoodsReceipts,
  getGoodsReceiptById,
  updateGoodsReceipt,
  scanBarcode,
  updateQualityControl,
  approveGoodsReceipt,
  getGoodsReceiptReport
}; 