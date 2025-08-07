// createTestUser.js
require('dotenv').config();

const mongoose = require('mongoose');
const User = require('./models/user');

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/viadora';

async function createTestUser() {
  try {
    await mongoose.connect(uri);
    console.log('MongoDB bağlantısı başarılı');

    // Mevcut test kullanıcısını kontrol et
    let testUser = await User.findOne({ email: 'test@viadora.com' });
    
    if (!testUser) {
      // Yeni test kullanıcısı oluştur
      testUser = new User({
        username: 'testuser',
        email: 'test@viadora.com',
        password: 'test123456',
        role: 'user',
        gamification: {
          points: 250,
          level: 'Silver',
          experience: 250,
          badges: [
            {
              id: 'firstPurchase',
              name: 'İlk Alışveriş',
              description: 'İlk alışverişini tamamladın!',
              icon: '🛍️',
              earnedAt: new Date(),
              progress: 1,
              maxProgress: 1
            },
            {
              id: 'dailyLogin',
              name: 'Günlük Giriş',
              description: '7 gün üst üste giriş yaptın!',
              icon: '📅',
              earnedAt: new Date(),
              progress: 7,
              maxProgress: 7
            }
          ],
          dailyTasks: [
            {
              id: 'login',
              name: 'Günlük Giriş',
              description: 'Bugün giriş yap',
              reward: 10,
              completed: true,
              progress: 1,
              maxProgress: 1,
              expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
            },
            {
              id: 'favorite',
              name: 'Favori Ekle',
              description: '3 ürün favori ekle',
              reward: 25,
              completed: false,
              progress: 1,
              maxProgress: 3,
              expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
            },
            {
              id: 'browse',
              name: 'Ürün Keşfet',
              description: '10 ürün görüntüle',
              reward: 15,
              completed: false,
              progress: 5,
              maxProgress: 10,
              expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
            },
            {
              id: 'profile',
              name: 'Profil Güncelle',
              description: 'Profil bilgilerini güncelle',
              reward: 20,
              completed: false,
              progress: 0,
              maxProgress: 1,
              expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
            }
          ],
          statistics: {
            totalPurchases: 5,
            totalSpent: 1250,
            favoriteProducts: 8,
            loginStreak: 7,
            lastLoginDate: new Date(),
            totalPointsEarned: 250,
            badgesEarned: 2,
            tasksCompleted: 15
          }
        }
      });

      await testUser.save();
      console.log('✓ Test kullanıcısı oluşturuldu');
    } else {
      console.log('✓ Test kullanıcısı zaten mevcut');
    }

    // Kullanıcı bilgilerini göster
    console.log('\nTest Kullanıcısı Bilgileri:');
    console.log(`ID: ${testUser._id}`);
    console.log(`Email: ${testUser.email}`);
    console.log(`Password: test123456`);
    console.log(`Points: ${testUser.gamification.points}`);
    console.log(`Level: ${testUser.gamification.level}`);
    console.log(`Badges: ${testUser.gamification.badges.length}`);
    console.log(`Tasks: ${testUser.gamification.dailyTasks.length}`);

    await mongoose.disconnect();
    console.log('\nİşlem tamamlandı!');
  } catch (error) {
    console.error('Hata:', error);
    await mongoose.disconnect();
  }
}

createTestUser(); 