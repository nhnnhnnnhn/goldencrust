const express = require('express');
const router = express.Router();
const stripeController = require('../controllers/stripe.controller');

// Tạo checkout session
router.post('/create-checkout-session', stripeController.createCheckoutSession);

// Kiểm tra trạng thái thanh toán
router.get('/check-payment/:sessionId', stripeController.checkPaymentStatus);

module.exports = router;
