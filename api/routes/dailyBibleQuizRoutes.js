const express = require('express');
const dailyBibleQuizController = require('../controllers/dailyBibleQuizController');
const authenticationMiddleware = require('../middlewares/authenticationMiddleware');
const router = express.Router();

// Protected routes (require authentication)
router.use(authenticationMiddleware.authenticate);

router.post('/', dailyBibleQuizController.submitDailyQuiz);
router.get('/', dailyBibleQuizController.getDailyQuiz);

module.exports = router;