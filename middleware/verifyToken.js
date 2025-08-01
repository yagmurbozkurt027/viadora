const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.token || req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Token gerekli' });

  const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : authHeader;

  jwt.verify(token, process.env.JWT_SECRET || 'gizli_anahtar', (err, user) => {
    if (err) return res.status(403).json({ error: 'Token geçersiz' });
    req.user = user;
    next();
  });
};

module.exports = verifyToken;
