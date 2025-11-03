// routes/analyticsRoutes.js
const express = require('express');
const { authenticate } = require('../middlewares/authenticationMiddleware');
const analyticsController = require('../controllers/analyticsController');

const router = express.Router();

router.use(authenticate);

router.post('/sessions/start', analyticsController.startSession);
router.post('/sessions/end', analyticsController.endSession);
router.post('/events', analyticsController.logEvent);
router.post('/crashes', analyticsController.logCrash);
router.post('/purchases', analyticsController.logPurchase);

module.exports = router;