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
        enum: ['credit_card', 'debit_card', 'paypal', 'cash'],
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