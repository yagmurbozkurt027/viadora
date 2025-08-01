const Order = require('../models/Order');
const Product = require('../models/Product');

// Sipariş oluştur
const createOrder = async (req, res) => {
  try {
    const { items, totalAmount } = req.body;

    if (!items || items.length === 0 || totalAmount === undefined) {
      return res.status(400).json({ message: 'Geçersiz sipariş verisi.' });
    }

    // 1. Stok kontrolü ve güncelleme
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({ message: 'Ürün bulunamadı.' });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({ message: `${product.name} için yeterli stok yok.` });
      }
      product.stock -= item.quantity;
      await product.save();
    }

    // 2. Siparişi oluştur
    const newOrder = new Order({
      user: req.user._id,
      items,
      totalAmount,
    });

    await newOrder.save();
    res.status(201).json({ message: 'Sipariş başarıyla oluşturuldu', order: newOrder });
  } catch (error) {
    res.status(500).json({ message: 'Sipariş oluşturulamadı', error: error.message });
  }
};

// Kullanıcının sipariş geçmişi
const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).populate('items.productId');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Sipariş geçmişi alınamadı', error: error.message });
  }
};

// Admin - tüm siparişleri getir
const getAllOrders = async (req, res) => {
  if (!req.user.isAdmin) {
    return res.status(403).json({ message: 'Yetkisiz işlem.' });
  }

  try {
    const orders = await Order.find().populate('user', 'name email').sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Tüm siparişler alınamadı', error: error.message });
  }
};

// Sipariş durumu güncelle (admin)
const updateOrderStatus = async (req, res) => {
  if (!req.user.isAdmin) {
    return res.status(403).json({ message: 'Yetkisiz işlem.' });
  }

  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Sipariş bulunamadı.' });

    order.status = req.body.status || order.status;
    await order.save();
    res.json({ message: 'Sipariş durumu güncellendi.', order });
  } catch (error) {
    res.status(500).json({ message: 'Sipariş durumu güncellenemedi.', error: error.message });
  }
};

// Sipariş iptal et (kullanıcı kendi siparişini iptal edebilir)
const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.user._id });
    if (!order) return res.status(404).json({ message: 'Sipariş bulunamadı.' });

    if (order.status !== 'Hazırlanıyor') {
      return res.status(400).json({ message: 'Sadece hazırlanıyor durumundaki sipariş iptal edilebilir.' });
    }

    order.status = 'İptal Edildi';
    await order.save();
    res.json({ message: 'Sipariş iptal edildi.', order });
  } catch (error) {
    res.status(500).json({ message: 'Sipariş iptal edilemedi.', error: error.message });
  }
};

module.exports = {
  createOrder,
  getUserOrders,
  getAllOrders,
  updateOrderStatus,
  cancelOrder
};