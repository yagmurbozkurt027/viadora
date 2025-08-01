const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  price: {
    type: Number,
    required: true
  },
  name: {
    type: String,
    required: true
  }
});

const addressSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  city: {
    type: String,
    required: true
  },
  postalCode: {
    type: String,
    required: true
  },
  country: {
    type: String,
    default: 'Türkiye'
  }
});

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [orderItemSchema],
  total: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'paid', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['stripe', 'paypal', 'cash'],
    required: true
  },
  paymentIntentId: {
    type: String,
    required: false
  },
  shippingAddress: addressSchema,
  billingAddress: addressSchema,
  trackingNumber: {
    type: String
  },
  notes: {
    type: String
  }
}, {
  timestamps: true
});

// Index for better query performance
orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ status: 1 });
orderSchema.index({ paymentIntentId: 1 });

module.exports = mongoose.model('Order', orderSchema);