const mongoose = require('mongoose');
const User = require('./models/user');

// MongoDB bağlantısı
mongoose.connect('mongodb://localhost:27017/butik-db')
  .then(() => {
    console.log('MongoDB bağlantısı başarılı');
    initGamification();
  })
  .catch(err => {
    console.error('MongoDB bağlantı hatası:', err);
  });

async function initGamification() {
  try {
    console.log('Gamification verisi başlatılıyor...');
    
    // Tüm kullanıcıları getir
    const users = await User.find({});
    console.log(`${users.length} kullanıcı bulundu`);
    
    let updatedCount = 0;
    
    for (const user of users) {
      // Eğer gamification verisi yoksa oluştur
      if (!user.gamification) {
        user.gamification = {
          points: 0,
          level: 'Bronze',
          experience: 0,
          badges: [],
          dailyTasks: [],
          statistics: {
            totalPurchases: 0,
            totalSpent: 0,
            favoriteProducts: 0,
            loginStreak: 0,
            lastLoginDate: null,
            totalPointsEarned: 0,
            badgesEarned: 0,
            tasksCompleted: 0
          }
        };
        
        // Günlük görevleri oluştur
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        user.gamification.dailyTasks = [
          {
            id: 'login',
            name: 'Günlük Giriş',
            description: 'Bugün giriş yap',
            reward: 10,
            completed: false,
            progress: 0,
            maxProgress: 1,
            expiresAt: tomorrow
          },
          {
            id: 'favorite',
            name: 'Favori Ekle',
            description: '3 ürün favori ekle',
            reward: 25,
            completed: false,
            progress: 0,
            maxProgress: 3,
            expiresAt: tomorrow
          },
          {
            id: 'browse',
            name: 'Ürün Keşfet',
            description: '10 ürün görüntüle',
            reward: 15,
            completed: false,
            progress: 0,
            maxProgress: 10,
            expiresAt: tomorrow
          },
          {
            id: 'profile',
            name: 'Profil Güncelle',
            description: 'Profil bilgilerini güncelle',
            reward: 20,
            completed: false,
            progress: 0,
            maxProgress: 1,
            expiresAt: tomorrow
          }
        ];
        
        await user.save();
        updatedCount++;
        console.log(`${user.username} için gamification verisi oluşturuldu`);
      }
    }
    
    console.log(`\n✅ Tamamlandı! ${updatedCount} kullanıcı için gamification verisi oluşturuldu.`);
    console.log('\nŞimdi gamification sayfasını test edebilirsiniz!');
    
    process.exit(0);
  } catch (error) {
    console.error('Hata:', error);
    process.exit(1);
  }
} 