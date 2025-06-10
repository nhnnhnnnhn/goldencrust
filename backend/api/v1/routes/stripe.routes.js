const express = require('express');
const router = express.Router();
const stripeController = require('../controllers/stripe.controller');

// Tạo checkout session
router.post('/create-checkout-session', stripeController.createCheckoutSession);

// Kiểm tra trạng thái thanh toán
router.get('/check-payment/:sessionId', stripeController.checkPaymentStatus);

// Lấy danh sách thanh toán từ Stripe
router.get('/payments', stripeController.getPayments);

// Lấy URL hoá đơn PDF từ Stripe
router.get('/invoice/:paymentId', stripeController.getInvoiceUrl);

// Lấy thông tin khách hàng từ payment intent
router.get('/customer/:paymentId', stripeController.getCustomerDetails);

// Xử lý hoàn tiền
router.post('/refund', stripeController.refundPayment);

// Xử lý webhook từ Stripe
// Lưu ý: Đường dẫn này cần được cấu hình trong trang quản lý Stripe
router.post('/webhook', express.raw({ type: 'application/json' }), stripeController.handleWebhook);

module.exports = router;
