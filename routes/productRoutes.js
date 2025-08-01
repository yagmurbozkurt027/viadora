const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const multer = require('multer');
const { parse } = require('csv-parse');
const fs = require('fs');
const authMiddleware = require('../middlewares/authMiddleware');
const isAdmin = require('../middlewares/isAdmin');
const upload = multer({ dest: 'uploads/' });

// Ürün oluştur (Sadece admin)
router.post('/', authMiddleware, isAdmin, async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Ürünleri listele
router.get('/', async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Ürün güncelle (Sadece admin)
router.put('/:id', authMiddleware, isAdmin, async (req, res) => {
  try {
    const updated = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ error: 'Ürün bulunamadı' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Ürün sil (Sadece admin)
router.delete('/:id', authMiddleware, isAdmin, async (req, res) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Ürün bulunamadı' });
    res.json({ message: 'Ürün silindi' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Toplu ürün yükleme (CSV) (Sadece admin)
router.post('/bulk-upload', authMiddleware, isAdmin, upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Dosya bulunamadı' });
  const products = [];
  fs.createReadStream(req.file.path)
    .pipe(parse({ columns: true, trim: true }))
    .on('data', (row) => {
      console.log('Satır:', row); // Her satırı terminale yaz
      products.push(row);
    })
    .on('end', async () => {
      try {
        console.log('Tüm okunan satırlar:', products);
        const validProducts = products
          .filter(p => String(p.name).trim() && String(p.price).trim())
          .map(p => ({
            ...p,
            name: String(p.name).trim(),
            price: Number(String(p.price).replace(',', '.').trim()),
            stock: p.stock ? Number(String(p.stock).replace(',', '.').trim()) : 0,
            image: p.image ? String(p.image).trim() : ''
          }));
        console.log('Valid Products:', validProducts);
        if (validProducts.length === 0) {
          fs.unlinkSync(req.file.path);
          return res.status(400).json({ error: 'Hiçbir satırda name ve price yok!', products });
        }
        const created = await Product.insertMany(validProducts);
        fs.unlinkSync(req.file.path);
        res.json({ message: `${created.length} ürün eklendi`, products: created });
      } catch (err) {
        console.error("insertMany hatası:", err);
        res.status(500).json({ error: err.message });
      }
    })
    .on('error', (err) => {
      console.error("CSV okuma hatası:", err);
      res.status(500).json({ error: err.message });
    });
});

// TEK ÜRÜN (DETAY)
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Ürün bulunamadı' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

module.exports = router;