const User = require('../models/user');
const { asyncHandler } = require('../middleware/errorHandler');
const log = require('../utils/logger');
const { sendEmail } = require('../utils/emailService');

const LEVEL_THRESHOLDS = {
  Bronze: 0,
  Silver: 100,
  Gold: 500,
  Platinum: 1000,
  Diamond: 2500
};

const BADGES = {
  firstPurchase: {
    id: 'firstPurchase',
    name: 'İlk Alışveriş',
    description: 'İlk alışverişini tamamladın!',
    icon: '🛍️',
    maxProgress: 1
  },
  loyalCustomer: {
    id: 'loyalCustomer',
    name: 'Sadık Müşteri',
    description: '10 alışveriş tamamladın!',
    icon: '👑',
    maxProgress: 10
  },
  bigSpender: {
    id: 'bigSpender',
    name: 'Büyük Alışveriş',
    description: '1000 TL üzerinde harcama yaptın!',
    icon: '💰',
    maxProgress: 1000
  },
  dailyLogin: {
    id: 'dailyLogin',
    name: 'Günlük Giriş',
    description: '7 gün üst üste giriş yaptın!',
    icon: '📅',
    maxProgress: 7
  },
  favoriteCollector: {
    id: 'favoriteCollector',
    name: 'Favori Toplayıcı',
    description: '20 ürün favori ekledin!',
    icon: '❤️',
    maxProgress: 20
  },
  taskMaster: {
    id: 'taskMaster',
    name: 'Görev Ustası',
    description: '50 günlük görev tamamladın!',
    icon: '✅',
    maxProgress: 50
  }
};

const DAILY_TASKS = [
  {
    id: 'login',
    name: 'Günlük Giriş',
    description: 'Bugün giriş yap',
    reward: 10,
    maxProgress: 1
  },
  {
    id: 'favorite',
    name: 'Favori Ekle',
    description: '3 ürün favori ekle',
    reward: 25,
    maxProgress: 3
  },
  {
    id: 'browse',
    name: 'Ürün Keşfet',
    description: '10 ürün görüntüle',
    reward: 15,
    maxProgress: 10
  },
  {
    id: 'profile',
    name: 'Profil Güncelle',
    description: 'Profil bilgilerini güncelle',
    reward: 20,
    maxProgress: 1
  }
];

const getUserGamification = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  
  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
  }

  const currentLevel = calculateLevel(user.gamification.points);
  const nextLevel = getNextLevel(currentLevel);
  const progressToNextLevel = calculateProgressToNextLevel(user.gamification.points, currentLevel);

  await refreshDailyTasks(user);

  res.json({
    points: user.gamification.points,
    level: currentLevel,
    nextLevel,
    progressToNextLevel,
    experience: user.gamification.experience,
    badges: user.gamification.badges,
    dailyTasks: user.gamification.dailyTasks,
    statistics: user.gamification.statistics
  });
});

// Puan ekle
const addPoints = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { points, reason } = req.body;

  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
  }

  const oldPoints = user.gamification.points;
  user.gamification.points += points;
  user.gamification.experience += points;
  user.gamification.statistics.totalPointsEarned += points;

  // Seviye kontrolü
  const oldLevel = calculateLevel(oldPoints);
  const newLevel = calculateLevel(user.gamification.points);
  
  if (newLevel !== oldLevel) {
    user.gamification.level = newLevel;
    log.user('levelUp', userId, { oldLevel, newLevel, points });
    
    // Seviye atlama e-postası gönder
    try {
      await sendEmail(user.email, 'levelUp', { username: user.username, newLevel });
    } catch (emailError) {
      console.error('Seviye atlama e-postası gönderilemedi:', emailError);
    }
  }

  await user.save();

  // Rozet kontrolü
  const newBadges = await checkAndAwardBadges(user);
  
  // Yeni rozet e-postaları gönder
  for (const badge of newBadges) {
    try {
      await sendEmail(user.email, 'gamificationAchievement', { 
        username: user.username, 
        achievement: badge 
      });
    } catch (emailError) {
      console.error('Rozet e-postası gönderilemedi:', emailError);
    }
  }

  res.json({
    message: `${points} puan eklendi`,
    reason,
    newPoints: user.gamification.points,
    newLevel: user.gamification.level,
    levelUp: newLevel !== oldLevel,
    newBadges: newBadges.length
  });
});

// Görev ilerlemesini güncelle
const updateTaskProgress = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { taskId, progress } = req.body;

  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
  }

  const task = user.gamification.dailyTasks.find(t => t.id === taskId);
  if (!task) {
    return res.status(404).json({ message: 'Görev bulunamadı' });
  }

  task.progress = Math.min(progress, task.maxProgress);
  
  // Görev tamamlandı mı kontrol et
  if (task.progress >= task.maxProgress && !task.completed) {
    task.completed = true;
    user.gamification.points += task.reward;
    user.gamification.experience += task.reward;
    user.gamification.statistics.totalPointsEarned += task.reward;
    user.gamification.statistics.tasksCompleted += 1;
    
    log.user('taskCompleted', userId, { taskId, reward: task.reward });
  }

  await user.save();

  // Rozet kontrolü
  await checkAndAwardBadges(user);

  res.json({
    message: 'Görev ilerlemesi güncellendi',
    task: task,
    newPoints: user.gamification.points
  });
});

// Liderlik tablosu
const getLeaderboard = asyncHandler(async (req, res) => {
  const users = await User.find({}, 'username gamification.points gamification.level gamification.statistics')
    .sort({ 'gamification.points': -1 })
    .limit(10);

  const leaderboard = users.map((user, index) => ({
    rank: index + 1,
    username: user.username,
    points: user.gamification.points,
    level: user.gamification.level,
    totalPurchases: user.gamification.statistics.totalPurchases,
    totalSpent: user.gamification.statistics.totalSpent
  }));

  res.json(leaderboard);
});

// Kullanıcının rozetlerini getir
const getUserBadges = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  
  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
  }

  // Tüm rozetleri kontrol et ve ilerleme durumlarını hesapla
  const allBadges = Object.values(BADGES).map(badge => {
    const userBadge = user.gamification.badges.find(b => b.id === badge.id);
    const progress = calculateBadgeProgress(user, badge.id);
    
    return {
      ...badge,
      earned: !!userBadge,
      earnedAt: userBadge?.earnedAt,
      progress: progress,
      completed: progress >= badge.maxProgress
    };
  });

  res.json(allBadges);
});

// Yardımcı fonksiyonlar
const calculateLevel = (points) => {
  if (points >= LEVEL_THRESHOLDS.Diamond) return 'Diamond';
  if (points >= LEVEL_THRESHOLDS.Platinum) return 'Platinum';
  if (points >= LEVEL_THRESHOLDS.Gold) return 'Gold';
  if (points >= LEVEL_THRESHOLDS.Silver) return 'Silver';
  return 'Bronze';
};

const getNextLevel = (currentLevel) => {
  const levels = Object.keys(LEVEL_THRESHOLDS);
  const currentIndex = levels.indexOf(currentLevel);
  return currentIndex < levels.length - 1 ? levels[currentIndex + 1] : null;
};

const calculateProgressToNextLevel = (points, currentLevel) => {
  const nextLevel = getNextLevel(currentLevel);
  if (!nextLevel) return 100;

  const currentThreshold = LEVEL_THRESHOLDS[currentLevel];
  const nextThreshold = LEVEL_THRESHOLDS[nextLevel];
  const progress = ((points - currentThreshold) / (nextThreshold - currentThreshold)) * 100;
  
  return Math.min(Math.max(progress, 0), 100);
};

const calculateBadgeProgress = (user, badgeId) => {
  switch (badgeId) {
    case 'firstPurchase':
      return user.gamification.statistics.totalPurchases;
    case 'loyalCustomer':
      return user.gamification.statistics.totalPurchases;
    case 'bigSpender':
      return user.gamification.statistics.totalSpent;
    case 'dailyLogin':
      return user.gamification.statistics.loginStreak;
    case 'favoriteCollector':
      return user.gamification.statistics.favoriteProducts;
    case 'taskMaster':
      return user.gamification.statistics.tasksCompleted;
    default:
      return 0;
  }
};

const checkAndAwardBadges = async (user) => {
  const newBadges = [];
  
  for (const [badgeId, badge] of Object.entries(BADGES)) {
    const progress = calculateBadgeProgress(user, badgeId);
    const existingBadge = user.gamification.badges.find(b => b.id === badgeId);
    
    if (progress >= badge.maxProgress && !existingBadge) {
      const newBadge = {
        id: badgeId,
        name: badge.name,
        description: badge.description,
        icon: badge.icon,
        earnedAt: new Date(),
        progress: progress,
        maxProgress: badge.maxProgress
      };
      
      user.gamification.badges.push(newBadge);
      user.gamification.statistics.badgesEarned += 1;
      log.user('badgeEarned', user._id, { badgeId, badgeName: badge.name });
      
      newBadges.push(newBadge);
    } else if (existingBadge) {
      existingBadge.progress = progress;
    }
  }
  
  return newBadges;
};

const refreshDailyTasks = async (user) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Bugünün görevlerini kontrol et
  const hasTodayTasks = user.gamification.dailyTasks.some(task => {
    const taskDate = new Date(task.expiresAt);
    taskDate.setHours(0, 0, 0, 0);
    return taskDate.getTime() === today.getTime();
  });

  // Bugünün görevleri yoksa yeni görevler oluştur
  if (!hasTodayTasks) {
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const newTasks = DAILY_TASKS.map(task => ({
      ...task,
      completed: false,
      progress: 0,
      expiresAt: tomorrow
    }));

    user.gamification.dailyTasks = newTasks;
    await user.save();
  }
};

module.exports = {
  getUserGamification,
  addPoints,
  updateTaskProgress,
  getLeaderboard,
  getUserBadges
}; 