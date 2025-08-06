const mongoose = require('mongoose');

const goodsReceiptSchema = new mongoose.Schema({
  receiptNumber: { type: String, required: true, unique: true },
  
  // Tedarikçi bilgileri
  supplier: {
    name: { type: String, required: true },
    taxNumber: { type: String, default: '' },
    address: { type: String, default: '' },
    phone: { type: String, default: '' },
    email: { type: String, default: '' }
  },
  
  // İrsaliye bilgileri
  deliveryNote: {
    number: { type: String, required: true },
    date: { type: Date, required: true },
    deliveryAddress: { type: String, default: '' }
  },
  
  // Fatura bilgileri
  invoice: {
    number: { type: String, default: '' },
    date: { type: Date },
    amount: { type: Number, default: 0 }
  },
  
  // Mal kabul detayları
  items: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    barcode: { type: String, default: '' },
    name: { type: String, required: true },
    size: { type: String, default: '' },
    color: { type: String, default: '' },
    season: { type: String, default: '' },
    category: { type: String, default: '' },
    
    // Miktar bilgileri
    orderedQuantity: { type: Number, required: true },
    receivedQuantity: { type: Number, required: true },
    acceptedQuantity: { type: Number, default: 0 },
    rejectedQuantity: { type: Number, default: 0 },
    
    // Fiyat bilgileri
    unitPrice: { type: Number, required: true },
    totalPrice: { type: Number, required: true },
    
    // Kalite kontrol
    qualityStatus: { type: String, enum: ['Beklemede', 'Kabul', 'Red', 'Kısmi Kabul'], default: 'Beklemede' },
    qualityNotes: { type: String, default: '' },
    
    // Beden asorti kontrolü
    sizeAssortment: {
      enabled: { type: Boolean, default: false },
      sizes: [{
        size: { type: String },
        quantity: { type: Number, default: 0 }
      }]
    }
  }],
  
  // Toplam bilgiler
  totalItems: { type: Number, required: true },
  totalQuantity: { type: Number, required: true },
  totalAmount: { type: Number, required: true },
  
  // Durum
  status: { type: String, enum: ['Beklemede', 'Kısmi Kabul', 'Tam Kabul', 'Red'], default: 'Beklemede' },
  
  // Tarih bilgileri
  receiptDate: { type: Date, default: Date.now },
  expectedDate: { type: Date },
  
  // Kontrol eden kişi
  checkedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  // Notlar
  notes: { type: String, default: '' },
  
  // Fotoğraflar
  photos: [{ type: String }],
  
  // İthal mal kabulü için özel alanlar
  import: {
    customsDeclaration: { type: String, default: '' },
    importDate: { type: Date },
    countryOfOrigin: { type: String, default: '' },
    hsCode: { type: String, default: '' },
    containerNumber: { type: String, default: '' }
  },
  
  // Barkod tarama geçmişi
  barcodeScans: [{
    barcode: { type: String, required: true },
    scannedAt: { type: Date, default: Date.now },
    scannedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' }
  }]
}, { timestamps: true });

// Mal kabul numarası için index
goodsReceiptSchema.index({ receiptNumber: 1 });
goodsReceiptSchema.index({ status: 1 });
goodsReceiptSchema.index({ receiptDate: 1 });
goodsReceiptSchema.index({ 'supplier.name': 1 });

module.exports = mongoose.model('GoodsReceipt', goodsReceiptSchema); 