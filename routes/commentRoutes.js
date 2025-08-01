const express = require('express');
const router = express.Router();
const Comment = require('../models/Comment');

router.post('/', async (req, res) => {
  console.log("Yorum ekleme isteği:", req.body);
  try {
    const { productId, username, rating, text } = req.body;
    if (!productId || !username || !rating || !text) {
      return res.status(400).json({ error: "Eksik alan var!" });
    }
    const comment = new Comment({ productId, username, rating, text });
    await comment.save();
    res.json(comment);
  } catch (err) {
    console.error("Yorum ekleme hatası:", err);
    res.status(500).json({ error: 'Sunucu hatası', detail: err.message });
  }
});

router.get('/product/:productId', async (req, res) => {
  const comments = await Comment.find({ productId: req.params.productId }).sort({ createdAt: -1 });
  res.json(comments);
});

module.exports = router;
