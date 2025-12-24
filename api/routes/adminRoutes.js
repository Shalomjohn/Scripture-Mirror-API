// routes/adminRoutes.js
const express = require('express');
const { authenticate } = require('../middlewares/authenticationMiddleware');
const { requireAdmin } = require('../middlewares/adminMiddleware');
const adminController = require('../controllers/adminController');
const User = require('../models/user');

const router = express.Router();

router.use(authenticate);

// Bootstrap: allow first admin promotion without admin
router.post('/users/promote', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'email is required' });

    const adminCount = await User.countDocuments({ role: 'admin' });
    const requesterIsAdmin = req.user && req.user.role === 'admin';

    if (adminCount > 0 && !requesterIsAdmin) {
      return res.status(403).json({ message: 'Forbidden - Admins only' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.role = 'admin';
    await user.save();

    return res.json({ message: 'User promoted to admin', userId: user._id });
  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
}); 

router.get('/metrics/overview', requireAdmin, adminController.getOverviewMetrics);
router.delete('/analytics', requireAdmin, adminController.deleteAnalytics);

module.exports = router;