const express = require('express');
const paymentController = require('../controllers/paymentController');
const router = express.Router();


router.post('/paystack-initialize', paymentController.initializePaystackPayment);
router.post('/paystack-verify', paymentController.verifyPaystackPayment);
router.post('/stripe-create-payment-intent', paymentController.stripeCreatePaymentIntent);

module.exports = router;