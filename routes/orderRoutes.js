const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');

// Doğrudan ürünlerle sipariş oluştur
router.post('/', async (req, res) => {
  try {
    const { items, totalAmount, userId } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0 || totalAmount === undefined || !userId) {
      return res.status(400).json({ error: 'Geçersiz sipariş verisi.' });
    }

    // Stok kontrolü ve güncelleme
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({ error: 'Ürün bulunamadı.' });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({ error: `${product.name} için yeterli stok yok.` });
      }
      product.stock -= item.quantity;
      await product.save();
    }

    // Siparişi oluştur (Order modeline uygun şekilde)
    const order = new Order({
      userId,
      items: items.map(item => ({
        product: item.productId,
        quantity: item.quantity
      })),
      total: totalAmount
    });

    await order.save();

    res.status(201).json({ message: "Sipariş başarıyla oluşturuldu.", order });
  } catch (err) {
    console.error("SİPARİŞ HATASI:", err);
    res.status(500).json({ error: "Sipariş oluşturulurken hata oluştu." });
  }
});

module.exports = router;