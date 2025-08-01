const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');

router.post('/', async (req, res) => {
  try {
    const { userId, items } = req.body;

    let cart = await Cart.findOne({ userId });

    if (!cart) {
      cart = new Cart({
        userId,
        items
      });
    } else {
      items.forEach(newItem => {
        const existingItem = cart.items.find(
          item => item.product.toString() === newItem.product
        );
        if (existingItem) {
          existingItem.quantity += newItem.quantity;
        } else {
          cart.items.push(newItem);
        }
      });
    }

    await cart.save();
    res.status(201).json(cart);
  } catch (err) {
    console.error("SEPET HATASI:", err);
    res.status(500).json({ error: "Sepete eklerken hata oluştu" });
  }
});

router.get('/:userId', async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.params.userId }).populate('items.product');
    if (!cart) {
      return res.status(404).json({ error: "Sepet bulunamadı" });
    }
    res.json(cart);
  } catch (err) {
    console.error("SEPET LİSTELEME HATASI:", err);
    res.status(500).json({ error: "Sepeti getirirken hata oluştu" });
  }
});

module.exports = router;