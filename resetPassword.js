// resetPassword.js
require('dotenv').config();

const mongoose = require('mongoose');
const User = require('./models/user');

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/viadora';

async function resetPassword() {
  try {
    await mongoose.connect(uri);
    console.log('MongoDB bağlantısı başarılı');

    const email = 'yagmurbzkrtt27@gmail.com';
    const newPassword = '123456'; // Yeni şifre

    const user = await User.findOne({ email });
    
    if (!user) {
      console.log('❌ Kullanıcı bulunamadı');
      return;
    }

    // Şifreyi güncelle
    user.password = newPassword;
    await user.save();

    console.log('✓ Şifre başarıyla güncellendi');
    console.log(`Email: ${user.email}`);
    console.log(`Username: ${user.username}`);
    console.log(`Yeni şifre: ${newPassword}`);

    await mongoose.disconnect();
    console.log('\nİşlem tamamlandı!');
  } catch (error) {
    console.error('Hata:', error);
    await mongoose.disconnect();
  }
}

resetPassword(); 