const express = require('express');
const router = express.Router();
const stripeController = require('../controllers/stripe.controller');

// Tạo checkout session
router.post('/create-checkout-session', stripeController.createCheckoutSession);

// Kiểm tra trạng thái thanh toán
router.get('/check-payment/:sessionId', stripeController.checkPaymentStatus);

// Xử lý webhook từ Stripe
// Lưu ý: Đường dẫn này cần được cấu hình trong trang quản lý Stripe
router.post('/webhook', express.raw({ type: 'application/json' }), stripeController.handleWebhook);

module.exports = router;
