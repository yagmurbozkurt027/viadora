// cleanProducts.js
require('dotenv').config();

const mongoose = require('mongoose');

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/viadora'; // .env'den al
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
