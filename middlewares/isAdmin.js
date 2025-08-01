// middlewares/isAdmin.js
module.exports = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(403).json({ message: 'Erişim reddedildi. Admin yetkisi gerekli.' });
  }
};
