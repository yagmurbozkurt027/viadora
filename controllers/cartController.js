const Cart = require('../models/Cart');
const Product = require('../models/Product');

const addToCart = async (req, res) => {
  const { userId, productId, quantity } = req.body;

  if (!userId || !productId || !quantity) {
    return res.status(400).json({ error: 'userId, productId ve quantity gerekli' });
  }

  try {
    let cart = await Cart.findOne({ userId });

    if (!cart) {
      cart = new Cart({ userId, items: [] });
    }

    const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);

    if (itemIndex > -1) {
      cart.items[itemIndex].quantity += quantity;
    } else {
      cart.items.push({ product: productId, quantity });
    }

    await cart.save();

    res.json({ message: 'Sepete ürün eklendi', cart });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
};

const getCart = async (req, res) => {
  const userId = req.params.userId;

  try {
    const cart = await Cart.findOne({ userId }).populate('items.product');

    if (!cart) {
      return res.status(404).json({ error: 'Sepet bulunamadı' });
    }

    res.json(cart);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
};

module.exports = {
  addToCart,
  getCart,
};
