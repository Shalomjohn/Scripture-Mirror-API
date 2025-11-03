// middlewares/adminMiddleware.js

const requireAdmin = (req, res, next) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden - Admins only' });
    }
    next();
  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
};

module.exports = { requireAdmin };