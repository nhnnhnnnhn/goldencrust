// const express = require('express');
// const router = express.Router();
// const paymentController = require('../controllers/payment.controller');
// const { body } = require('express-validator');
// const validateRequest = require('../middlewares/validateRequest.middleware');

// // Create payment intent
// router.post(
//     '/create-intent',
//     [
//         body('orderId').isMongoId().withMessage('Valid order ID is required'),
//         body('paymentMethodId').optional(),
//         validateRequest
//     ],
//     paymentController.createPaymentIntent
// );

// // Confirm payment
// router.post(
//     '/confirm',
//     [
//         body('paymentIntentId').notEmpty().withMessage('Payment Intent ID is required'),
//         validateRequest
//     ],
//     paymentController.confirmPayment
// );

// // Cancel payment
// router.post(
//     '/cancel',
//     [
//         body('paymentIntentId').notEmpty().withMessage('Payment Intent ID is required'),
//         validateRequest
//     ],
//     paymentController.cancelPayment
// );

// // Stripe webhook handler (No auth middleware for this route)
// router.post('/webhook', express.raw({ type: 'application/json' }), paymentController.handleStripeWebhook);

// // Get payment history for the current user
// router.get('/history', paymentController.getPaymentHistory);

// // Get payment details
// router.get('/:id', paymentController.getPaymentDetails);

// module.exports = router;
