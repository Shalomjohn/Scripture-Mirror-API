const express = require('express');
const authController = require('../controllers/authController');
const authenticationMiddleware = require('../middlewares/authenticationMiddleware');
const router = express.Router();


router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/send-email-otp', authController.sendEmailOTP);
router.post('/verify-email-otp', authController.verifyEmailOTP);
router.post('/reset-password', authController.resetPassword);


// router.post('/custom_delete_account_by_email', authController.deleteUserByEmail);


// Protected routes (require authentication)
router.use(authenticationMiddleware.authenticate);

router.post('/renew-token', authController.renewToken);
router.post('/find-match', authController.findMatch);
router.get('/bookmarks', authController.getBookmarks);
router.post('/add-bookmark', authController.addBookmark);
router.post('/remove-bookmark', authController.removeBookmark);

module.exports = router;
