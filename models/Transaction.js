const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
  type: { type: String, enum: ['girdi', 'çıktı'], required: true },
  date: { type: Date, default: Date.now },
  user: { type: String }, // Kullanıcı adı veya ID
  description: { type: String },
  total: { type: Number, required: true },
  storeName: { type: String, required: true },
  items: [{ type: mongoose.Schema.Types.ObjectId, ref: 'TransactionItem' }]
});

module.exports = mongoose.model('Transaction', TransactionSchema); 