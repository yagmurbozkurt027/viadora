// checkProducts.js
require('dotenv').config();

const mongoose = require('mongoose');
const Product = require('./models/Product');

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/viadora';

async function checkProducts() {
  try {
    await mongoose.connect(uri);
    console.log('MongoDB bağlantısı başarılı');

    const products = await Product.find();
    console.log(`\nToplam ürün sayısı: ${products.length}`);
    
    console.log('\nÜrün listesi:');
    products.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name}`);
      console.log(`   Fiyat: ${product.price}₺`);
      console.log(`   Kategori: ${product.category}`);
      console.log(`   Resim: ${product.image}`);
      console.log(`   Stok: ${product.stock}`);
      console.log('---');
    });

    await mongoose.disconnect();
    console.log('\nKontrol tamamlandı!');
  } catch (error) {
    console.error('Hata:', error);
    await mongoose.disconnect();
  }
}

checkProducts(); 