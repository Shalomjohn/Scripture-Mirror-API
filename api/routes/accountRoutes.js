const express = require('express');
const authController = require('../controllers/authController');
const router = express.Router();


router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/send-email-otp', authController.sendEmailOTP);
router.post('/verify-email-otp', authController.verifyEmailOTP);

module.exports = router;