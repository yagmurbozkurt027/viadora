// checkUsers.js
require('dotenv').config();

const mongoose = require('mongoose');
const User = require('./models/user');

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/viadora';

async function checkUsers() {
  try {
    await mongoose.connect(uri);
    console.log('MongoDB bağlantısı başarılı');

    const users = await User.find({}, 'username email role createdAt');
    console.log(`\nToplam kullanıcı sayısı: ${users.length}`);
    
    console.log('\nKullanıcı listesi:');
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.username}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Oluşturulma: ${user.createdAt}`);
      console.log('---');
    });

    await mongoose.disconnect();
    console.log('\nKontrol tamamlandı!');
  } catch (error) {
    console.error('Hata:', error);
    await mongoose.disconnect();
  }
}

checkUsers(); 