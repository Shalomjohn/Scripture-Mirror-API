const express = require('express');
const authController = require('../controllers/authController');
const quizController = require('../controllers/characterQuizController');
const authenticationMiddleware = require('../middlewares/authenticationMiddleware');
const router = express.Router();

// Public routes
router.get('/quiz-sections', quizController.getQuizSections);
router.get('/quiz-questions/:sectionId', quizController.getQuizQuestions);

// Protected routes (require authentication)
router.use(authenticationMiddleware.authenticate);

router.post('/find-match', authController.findMatch);

module.exports = router;