const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    paymentMethod: {
        type: String,
        enum: ['credit_card', 'debit_card', 'paypal', 'cash', 'stripe'],
        required: true
    },
    transactionId: {
        type: String,
        required: true,
        unique: true
    },
    orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: true
    },
    stripePaymentIntentId: {
        type: String,
        sparse: true
    },
    stripeCustomerId: {
        type: String,
        sparse: true
    },
    stripeChargeId: {
        type: String,
        sparse: true
    },
    stripePaymentMethodId: {
        type: String,
        sparse: true
    },
    currency: {
        type: String,
        default: 'usd'
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'failed'],
        default: 'pending'
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    deleted: { 
        type: Boolean,
        default: false
    },
    deletedAt: Date
}, {
    timestamps: true
});

const Payment = mongoose.model('Payment', paymentSchema, 'payment');
module.exports = Payment;