const mongoose = require('mongoose');

const wholesaleCustomerSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  customerType: { type: String, default: 'wholesale' },
  creditLimit: { type: Number, default: 0 },
  paymentTerms: { type: String, default: '30 gün' },
  bulkDiscount: { type: Number, default: 0 },
  minimumOrder: { type: Number, default: 0 },
  specialPricing: { type: Boolean, default: false },
  customerTier: { type: String, enum: ['Bronze', 'Silver', 'Gold', 'Platinum'], default: 'Bronze' },
  businessInfo: {
    companyName: String,
    taxNumber: String,
    address: String,
    phone: String,
    email: String
  },
  status: { type: String, enum: ['active', 'inactive', 'pending'], default: 'pending' },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  approvedAt: Date
}, { timestamps: true });

module.exports = mongoose.model('WholesaleCustomer', wholesaleCustomerSchema);
