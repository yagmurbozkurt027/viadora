const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
  invoiceNumber: { type: String, required: true, unique: true },
  invoiceType: { 
    type: String, 
    required: true, 
    enum: ['Satış Faturası', 'İthal Faturası', 'İrsaliye', 'Tanıtım'] 
  },
  
  // Müşteri bilgileri
  customer: {
    name: { type: String, required: true },
    taxNumber: { type: String, default: '' },
    address: { type: String, default: '' },
    phone: { type: String, default: '' },
    email: { type: String, default: '' }
  },
  
  // Tedarikçi bilgileri (ithal faturası için)
  supplier: {
    name: { type: String, default: '' },
    taxNumber: { type: String, default: '' },
    address: { type: String, default: '' },
    country: { type: String, default: '' }
  },
  
  // Fatura detayları
  items: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    barcode: { type: String, default: '' },
    name: { type: String, required: true },
    size: { type: String, default: '' },
    color: { type: String, default: '' },
    quantity: { type: Number, required: true },
    unitPrice: { type: Number, required: true },
    totalPrice: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    taxRate: { type: Number, default: 18 }
  }],
  
  // Fiyat bilgileri
  subtotal: { type: Number, required: true },
  taxAmount: { type: Number, required: true },
  discountAmount: { type: Number, default: 0 },
  totalAmount: { type: Number, required: true },
  
  // Ödeme bilgileri
  paymentMethod: { type: String, enum: ['Nakit', 'Kredi Kartı', 'Banka Transferi', 'Çek'], default: 'Nakit' },
  paymentStatus: { type: String, enum: ['Ödendi', 'Beklemede', 'Kısmi'], default: 'Beklemede' },
  paidAmount: { type: Number, default: 0 },
  
  // Tarih bilgileri
  invoiceDate: { type: Date, default: Date.now },
  dueDate: { type: Date },
  
  // Durum
  status: { type: String, enum: ['Taslak', 'Onaylandı', 'Gönderildi', 'İptal'], default: 'Taslak' },
  
  // Notlar
  notes: { type: String, default: '' },
  
  // İrsaliye bilgileri
  deliveryNote: {
    number: { type: String, default: '' },
    date: { type: Date },
    deliveryAddress: { type: String, default: '' }
  },
  
  // İthal faturası özel alanları
  import: {
    customsNumber: { type: String, default: '' },
    importDate: { type: Date },
    countryOfOrigin: { type: String, default: '' },
    hsCode: { type: String, default: '' }
  },
  
  // Tanıtım faturası
  promotion: {
    reason: { type: String, default: '' },
    targetAudience: { type: String, default: '' }
  },
  
  // Oluşturan kullanıcı
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  // PDF dosya yolu
  pdfPath: { type: String, default: '' }
}, { timestamps: true });

// Fatura numarası için index
invoiceSchema.index({ invoiceNumber: 1 });
invoiceSchema.index({ invoiceType: 1 });
invoiceSchema.index({ status: 1 });
invoiceSchema.index({ invoiceDate: 1 });

module.exports = mongoose.model('Invoice', invoiceSchema); 