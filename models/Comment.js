// models/Comment.js
const mongoose = require('mongoose');
const CommentSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  username: { type: String, required: true },
  rating: { type: Number, min: 1, max: 5, required: true },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Comment', CommentSchema);
