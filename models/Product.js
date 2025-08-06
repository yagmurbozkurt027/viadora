const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  price: { type: Number, required: true },
  description: { type: String, default: '' },
  stock: { type: Number, default: 0 },
  image: { type: String, default: '' },
  
  // Butik özellikleri
  season: { type: String, required: true, enum: ['İlkbahar', 'Yaz', 'Sonbahar', 'Kış', 'Sezon Dışı'] },
  category: { type: String, required: true, enum: ['Elbise', 'Bluz', 'Pantolon', 'Etek', 'Ceket', 'Mont', 'Kazak', 'Tişört', 'Aksesuar'] },
  brand: { type: String, default: '' },
  color: { type: String, default: '' },
  material: { type: String, default: '' },
  
  // Barkod sistemi
  barcodes: [{ 
    code: { type: String, required: true, unique: true },
    type: { type: String, enum: ['Ana', 'Beden', 'Renk'], default: 'Ana' },
    beden: { type: String, default: '' },
    color: { type: String, default: '' }
  }],
  
  // Beden sistemi
  sizes: [{
    name: { type: String, required: true, enum: ['XS', 'S', 'M', 'L', 'XL', 'XXL', '36', '38', '40', '42', '44', '46'] },
    stock: { type: Number, default: 0 },
    barcode: { type: String, default: '' }
  }],
  
  // Beden asorti
  sizeAssortment: {
    enabled: { type: Boolean, default: false },
    sizes: [{ type: String }],
    totalStock: { type: Number, default: 0 }
  },
  
  // Beden seti
  sizeSet: {
    enabled: { type: Boolean, default: false },
    setName: { type: String, default: '' },
    items: [{
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
      size: { type: String },
      quantity: { type: Number, default: 1 }
    }]
  },
  
  // Fiyat bilgileri
  costPrice: { type: Number, default: 0 },
  salePrice: { type: Number, required: true },
  discountPrice: { type: Number, default: 0 },
  
  // Stok yönetimi
  minStock: { type: Number, default: 0 },
  maxStock: { type: Number, default: 1000 },
  
  // Durum
  status: { type: String, enum: ['Aktif', 'Pasif', 'Tükendi'], default: 'Aktif' },
  
  // Görsel
  images: [{ type: String }],
  
  // SEO
  tags: [{ type: String }],
  metaDescription: { type: String, default: '' }
}, { timestamps: true });

// Barkod arama için index
productSchema.index({ 'barcodes.code': 1 });
productSchema.index({ category: 1, season: 1 });
productSchema.index({ status: 1 });

module.exports = mongoose.model('Product', productSchema);
