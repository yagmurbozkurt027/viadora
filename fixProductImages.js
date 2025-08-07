// fixProductImages.js
require('dotenv').config();

const mongoose = require('mongoose');
const Product = require('./models/Product');

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/viadora';

// Resim ismi düzeltmeleri
const imageFixes = {
  '/images/beyaz-spor-ayakkabı.jpg': '/images/beyaz-spor-ayakkabi.jpg',
  '/images/gri-pantolon.jpg': '/images/pantolon.jpg', // gri-pantolon.jpg yok, pantolon.jpg var
  '/images/kirmizi-elbise.jpg': '/images/kirmizi-elbise.jpg', // Bu zaten var
  '/images/siyah-ceket.jpg': '/images/siyah-ceket.jpg', // Bu zaten var
  '/images/mavi-gomlek.jpg': '/images/mavi-gomlek.jpg', // Bu zaten var
  '/images/kahverengi-bot.jpg': '/images/kahverengi-bot.jpg', // Bu zaten var
  '/images/lacivert-mont.jpg': '/images/lacivert-mont.jpg', // Bu zaten var
  '/images/krem-kazak.jpg': '/images/krem-kazak.jpg', // Bu zaten var
  '/images/mor-hirka.jpg': '/images/mor-hirka.jpg', // Bu zaten var
  '/images/pembe-tisort.jpg': '/images/pembe-tisort.jpg' // Bu zaten var
};

async function fixProductImages() {
  try {
    await mongoose.connect(uri);
    console.log('MongoDB bağlantısı başarılı');

    const products = await Product.find();
    console.log(`Toplam ${products.length} ürün bulundu`);

    for (const product of products) {
      if (product.image && imageFixes[product.image]) {
        const oldImage = product.image;
        const newImage = imageFixes[product.image];
        
        console.log(`${product.name}: ${oldImage} -> ${newImage}`);
        
        product.image = newImage;
        await product.save();
      }
    }

    console.log('✓ Tüm ürün resimleri düzeltildi');
    
    // Kontrol et
    const updatedProducts = await Product.find();
    console.log('\nGüncellenmiş ürünler:');
    updatedProducts.forEach(p => {
      console.log(`${p.name}: ${p.image}`);
    });

    await mongoose.disconnect();
    console.log('\nİşlem tamamlandı!');
  } catch (error) {
    console.error('Hata:', error);
    await mongoose.disconnect();
  }
}

fixProductImages(); 