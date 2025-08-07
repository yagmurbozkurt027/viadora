// createUser.js
require('dotenv').config();

const mongoose = require('mongoose');
const User = require('./models/user');

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/viadora';

async function createUser() {
  try {
    await mongoose.connect(uri);
    console.log('MongoDB bağlantısı başarılı');

    // Kullanıcı bilgileri
    const userData = {
      username: 'yagmurbozkurt',
      email: 'yagmurbzkrtt27@gmail.com',
      password: '123456', // Bu şifreyi değiştirebilirsiniz
      role: 'user',
      gamification: {
        points: 100,
        level: 'Bronze',
        experience: 100,
        badges: [],
        dailyTasks: [],
        statistics: {
          totalPurchases: 0,
          totalSpent: 0,
          favoriteProducts: 0,
          loginStreak: 0,
          lastLoginDate: new Date(),
          totalPointsEarned: 100,
          badgesEarned: 0,
          tasksCompleted: 0
        }
      }
    };

    // Mevcut kullanıcıyı kontrol et
    const existingUser = await User.findOne({ email: userData.email });
    
    if (existingUser) {
      console.log('✓ Kullanıcı zaten mevcut');
      console.log(`Username: ${existingUser.username}`);
      console.log(`Email: ${existingUser.email}`);
    } else {
      // Yeni kullanıcı oluştur
      const newUser = new User(userData);
      await newUser.save();
      console.log('✓ Yeni kullanıcı oluşturuldu');
      console.log(`Username: ${newUser.username}`);
      console.log(`Email: ${newUser.email}`);
      console.log(`Password: ${userData.password}`);
    }

    await mongoose.disconnect();
    console.log('\nİşlem tamamlandı!');
  } catch (error) {
    console.error('Hata:', error);
    await mongoose.disconnect();
  }
}

createUser(); 