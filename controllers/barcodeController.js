const Product = require('../models/Product');
const Invoice = require('../models/Invoice');
const GoodsReceipt = require('../models/GoodsReceipt');

// Barkod ile ürün arama
const searchByBarcode = async (req, res) => {
  try {
    const { barcode } = req.params;
    
    if (!barcode) {
      return res.status(400).json({ error: 'Barkod gerekli' });
    }

    const product = await Product.findOne({
      'barcodes.code': barcode
    }).populate('sizes');

    if (!product) {
      return res.status(404).json({ error: 'Ürün bulunamadı' });
    }

    res.json({
      success: true,
      product: {
        id: product._id,
        name: product.name,
        price: product.salePrice,
        category: product.category,
        season: product.season,
        brand: product.brand,
        color: product.color,
        sizes: product.sizes,
        stock: product.stock,
        images: product.images,
        barcodes: product.barcodes
      }
    });
  } catch (error) {
    console.error('Barkod arama hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
};

// Çoklu barkod ile ürün arama
const searchMultipleBarcodes = async (req, res) => {
  try {
    const { barcodes } = req.body;
    
    if (!Array.isArray(barcodes) || barcodes.length === 0) {
      return res.status(400).json({ error: 'Barkod listesi gerekli' });
    }

    const products = await Product.find({
      'barcodes.code': { $in: barcodes }
    }).populate('sizes');

    const results = products.map(product => ({
      id: product._id,
      name: product.name,
      price: product.salePrice,
      category: product.category,
      season: product.season,
      brand: product.brand,
      color: product.color,
      sizes: product.sizes,
      stock: product.stock,
      images: product.images,
      barcodes: product.barcodes
    }));

    res.json({
      success: true,
      products: results,
      found: results.length,
      total: barcodes.length
    });
  } catch (error) {
    console.error('Çoklu barkod arama hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
};

// Ürüne barkod ekleme
const addBarcodeToProduct = async (req, res) => {
  try {
    const { productId, code, type, beden, color } = req.body;

    if (!code) {
      return res.status(400).json({ error: 'Barkod gerekli' });
    }

    // Barkod benzersizlik kontrolü
    const existingBarcode = await Product.findOne({
      'barcodes.code': code
    });

    if (existingBarcode) {
      return res.status(400).json({ error: 'Bu barkod zaten kullanımda' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: 'Ürün bulunamadı' });
    }

    product.barcodes.push({
      code: code,
      type: type || 'Ana',
      beden: beden || '',
      color: color || ''
    });

    await product.save();

    res.json({
      success: true,
      message: 'Barkod başarıyla eklendi',
      product: product
    });
  } catch (error) {
    console.error('Barkod ekleme hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
};

// Barkod güncelleme
const updateBarcode = async (req, res) => {
  try {
    const { productId, barcodeId } = req.params;
    const { barcode, type, beden, color } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: 'Ürün bulunamadı' });
    }

    const barcodeIndex = product.barcodes.findIndex(b => b._id.toString() === barcodeId);
    if (barcodeIndex === -1) {
      return res.status(404).json({ error: 'Barkod bulunamadı' });
    }

    // Yeni barkod benzersizlik kontrolü
    if (barcode && barcode !== product.barcodes[barcodeIndex].code) {
      const existingBarcode = await Product.findOne({
        'barcodes.code': barcode
      });

      if (existingBarcode) {
        return res.status(400).json({ error: 'Bu barkod zaten kullanımda' });
      }
    }

    if (barcode) product.barcodes[barcodeIndex].code = barcode;
    if (type) product.barcodes[barcodeIndex].type = type;
    if (beden !== undefined) product.barcodes[barcodeIndex].beden = beden;
    if (color !== undefined) product.barcodes[barcodeIndex].color = color;

    await product.save();

    res.json({
      success: true,
      message: 'Barkod başarıyla güncellendi',
      barcode: product.barcodes[barcodeIndex]
    });
  } catch (error) {
    console.error('Barkod güncelleme hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
};

// Barkod silme
const deleteBarcode = async (req, res) => {
  try {
    const { barcodeCode } = req.params;

    const product = await Product.findOne({
      'barcodes.code': barcodeCode
    });
    
    if (!product) {
      return res.status(404).json({ error: 'Barkod bulunamadı' });
    }

    product.barcodes = product.barcodes.filter(b => b.code !== barcodeCode);
    await product.save();

    res.json({
      success: true,
      message: 'Barkod başarıyla silindi'
    });
  } catch (error) {
    console.error('Barkod silme hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
};

// Barkod tarama geçmişi
const getBarcodeScanHistory = async (req, res) => {
  try {
    const { barcode } = req.params;
    const { limit = 50, page = 1 } = req.query;

    const skip = (page - 1) * limit;

    const scans = await GoodsReceipt.aggregate([
      { $unwind: '$barcodeScans' },
      { $match: { 'barcodeScans.barcode': barcode } },
      { $sort: { 'barcodeScans.scannedAt': -1 } },
      { $skip: skip },
      { $limit: parseInt(limit) },
      {
        $project: {
          receiptNumber: 1,
          receiptDate: 1,
          supplier: 1,
          scannedAt: '$barcodeScans.scannedAt',
          scannedBy: '$barcodeScans.scannedBy'
        }
      }
    ]);

    const total = await GoodsReceipt.aggregate([
      { $unwind: '$barcodeScans' },
      { $match: { 'barcodeScans.barcode': barcode } },
      { $count: 'total' }
    ]);

    res.json({
      success: true,
      scans: scans,
      total: total[0]?.total || 0,
      page: parseInt(page),
      limit: parseInt(limit)
    });
  } catch (error) {
    console.error('Barkod geçmişi hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
};

// Barkod raporu
const getBarcodeReport = async (req, res) => {
  try {
    const { startDate, endDate, type } = req.query;

    let matchQuery = {};
    if (startDate && endDate) {
      matchQuery.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    if (type) {
      matchQuery['barcodes.type'] = type;
    }

    const report = await Product.aggregate([
      { $match: matchQuery },
      { $unwind: '$barcodes' },
      {
        $group: {
          _id: '$barcodes.type',
          count: { $sum: 1 },
          products: { $addToSet: '$name' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.json({
      success: true,
      report: report
    });
  } catch (error) {
    console.error('Barkod raporu hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
};

module.exports = {
  searchByBarcode,
  searchMultipleBarcodes,
  addBarcodeToProduct,
  updateBarcode,
  deleteBarcode,
  getBarcodeScanHistory,
  getBarcodeReport
}; 