// cleanProducts.js
const mongoose = require('mongoose');

const uri = 'mongodb://127.0.0.1:27017/butik-db'; // Gerekirse kendi bağlantı adresini yaz
const Product = require('./models/Product');

async function cleanProducts() {
  await mongoose.connect(uri);

  // İsmi olmayan veya undefined olan ürünleri sil
  await Product.deleteMany({ $or: [ { name: { $exists: false } }, { name: null }, { name: "" }, { name: "undefined" } ] });
  console.log('İsmi olmayan veya undefined olan ürünler silindi.');

  await mongoose.disconnect();
  console.log('Temizlik tamamlandı!');
}

cleanProducts();
