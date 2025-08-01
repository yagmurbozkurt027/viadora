const mongoose = require('mongoose');

const TransactionItemSchema = new mongoose.Schema({
  productName: { type: String, required: true },
  quantity: { type: Number, required: true },
  unitPrice: { type: Number, required: true },
  totalPrice: { type: Number, required: true },
  transaction: { type: mongoose.Schema.Types.ObjectId, ref: 'Transaction' }
});

module.exports = mongoose.model('TransactionItem', TransactionItemSchema); 