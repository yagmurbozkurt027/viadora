const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

if (mongoose.models.User) {
  module.exports = mongoose.model('User');
} else {
  const userSchema = new mongoose.Schema({
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    phone: {
      type: String,
      trim: true,
    },
    birthDate: {
      type: Date,
    },
    gender: {
      type: String,
      enum: ["erkek", "kadın", "diğer"],
    },
    address: {
      city: String,
      district: String,
      postalCode: String,
      fullAddress: String,
    },
    // Gamification Sistemi
    gamification: {
      points: {
        type: Number,
        default: 0,
      },
      level: {
        type: String,
        enum: ["Bronze", "Silver", "Gold", "Platinum", "Diamond"],
        default: "Bronze",
      },
      experience: {
        type: Number,
        default: 0,
      },
      badges: [{
        id: String,
        name: String,
        description: String,
        icon: String,
        earnedAt: {
          type: Date,
          default: Date.now,
        },
        progress: {
          type: Number,
          default: 0,
        },
        maxProgress: {
          type: Number,
          default: 1,
        },
      }],
      dailyTasks: [{
        id: String,
        name: String,
        description: String,
        reward: Number,
        completed: {
          type: Boolean,
          default: false,
        },
        progress: {
          type: Number,
          default: 0,
        },
        maxProgress: {
          type: Number,
          default: 1,
        },
        expiresAt: Date,
      }],
      statistics: {
        totalPurchases: {
          type: Number,
          default: 0,
        },
        totalSpent: {
          type: Number,
          default: 0,
        },
        favoriteProducts: {
          type: Number,
          default: 0,
        },
        loginStreak: {
          type: Number,
          default: 0,
        },
        lastLoginDate: Date,
        totalPointsEarned: {
          type: Number,
          default: 0,
        },
        badgesEarned: {
          type: Number,
          default: 0,
        },
        tasksCompleted: {
          type: Number,
          default: 0,
        },
      },
    },
    // İki faktörlü doğrulama
    twoFactorEnabled: {
      type: Boolean,
      default: false,
    },
    twoFactorSecret: String,
    backupCodes: [String],
    // Giriş geçmişi
    loginHistory: [{
      device: { type: String },
      browser: { type: String },
      ip: { type: String },
      location: { type: String },
      timestamp: { type: Date, default: Date.now },
      success: { type: Boolean, default: true }
    }],
    // Şifre gücü
    passwordStrength: { type: Number, default: 0 },
    lastPasswordChange: { type: Date, default: Date.now },
    // Bildirim tercihleri
    notifications: {
      emailNotifications: { type: Boolean, default: true },
      priceAlerts: { type: Boolean, default: true },
      gamificationUpdates: { type: Boolean, default: true },
      marketingEmails: { type: Boolean, default: false },
      sms: { type: Boolean, default: false },
      push: { type: Boolean, default: true },
      security: { type: Boolean, default: true }
    },
    // Gizlilik ayarları
    privacy: {
      profileVisible: { type: Boolean, default: true },
      showEmail: { type: Boolean, default: false },
      showPhone: { type: Boolean, default: false },
      showBirthDate: { type: Boolean, default: false },
      allowSearch: { type: Boolean, default: true },
      dataSharing: { type: Boolean, default: false }
    },
    stocks: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        quantity: { type: Number, default: 1 }
      }
    ],
    favorites: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Product" }
    ],
    createdAt: {
      type: Date,
      default: Date.now,
    },
  });

  // Şifre hash'leme middleware
  userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    
    try {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
      next();
    } catch (error) {
      next(error);
    }
  });

  // Şifre karşılaştırma metodu
  userSchema.methods.comparePassword = async function(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
  };

  module.exports = mongoose.model('User', userSchema);
}