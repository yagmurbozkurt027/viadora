// clearRateLimit.js
require('dotenv').config();

const mongoose = require('mongoose');

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/viadora';

async function clearRateLimit() {
  try {
    await mongoose.connect(uri);
    console.log('MongoDB bağlantısı başarılı');

    // Rate limit verilerini temizle
    const db = mongoose.connection.db;
    
    // Redis benzeri rate limit verilerini temizle
    try {
      await db.collection('rateLimit').deleteMany({});
      console.log('✓ Rate limit verileri temizlendi');
    } catch (error) {
      console.log('Rate limit koleksiyonu bulunamadı, bu normal');
    }

    // Blacklist verilerini temizle
    try {
      await db.collection('blacklist').deleteMany({});
      console.log('✓ Blacklist verileri temizlendi');
    } catch (error) {
      console.log('Blacklist koleksiyonu bulunamadı, bu normal');
    }

    console.log('✓ Rate limit sıfırlandı!');
    console.log('Artık giriş yapabilirsiniz.');

    await mongoose.disconnect();
    console.log('\nİşlem tamamlandı!');
  } catch (error) {
    console.error('Hata:', error);
    await mongoose.disconnect();
  }
}

clearRateLimit(); 