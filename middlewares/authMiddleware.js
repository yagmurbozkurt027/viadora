const jwt = require('jsonwebtoken');
const User = require('../models/User');

// ✅ .env dosyasından al
const JWT_SECRET = process.env.JWT_SECRET;

const authMiddleware = async (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ message: 'Token bulunamadı' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Geçersiz token' });
  }
};

module.exports = authMiddleware;
