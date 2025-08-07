const express = require('express');
const paymentController = require('../controllers/paymentController');
const router = express.Router();


router.post('/paystack-initialize', paymentController.initializePaystackPayment);
router.post('/paystack-verify', paymentController.verifyPaystackPayment);
router.post('/stripe-create-payment-intent', paymentController.stripeCreatePaymentIntent);
router.post('/paypal/create-order', paymentController.createPaypalOrder);
router.post('/paypal/capture', paymentController.capturePaypalPayment);
router.post('/crypto/create', paymentController.createCryptoPayment);
router.get('/crypto/status', paymentController.checkCryptoPaymentStatus);
router.get('/crypto/currencies', paymentController.getSupportedNowpaymentCurrencies);
router.get('/crypto/estimate', paymentController.getCryptoEstimate);

module.exports = router;