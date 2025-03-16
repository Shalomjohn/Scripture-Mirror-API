const express = require('express');
const dailyScriptureController = require('../controllers/dailyScriptureController');
const authenticationMiddleware = require('../middlewares/authenticationMiddleware');
const router = express.Router();

router.post('/set', dailyScriptureController.setDailyScripture);

// Protected routes (require authentication)
router.use(authenticationMiddleware.authenticate);

router.get('/get', dailyScriptureController.getDailyScripture);

module.exports = router;