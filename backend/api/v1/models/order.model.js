const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    reservationId: String,
    userId: String,
    restaurantId: String,
    totalAmount: Number,
    status: {
        type: String,
        enum: ['pending', 'completed', 'cancelled'],
        default: 'pending'
    },
    paymentMethod : {
        type: String,
        enum: ['cash', 'card', 'QR'],
        default: 'card'
    },
    paymentStatus: {
        type: String,
        enum: ['paid', 'pending', 'failed'],
        default: 'pending'
    },
    deleted: { 
        type: Boolean,
        default: false
    },
    deletedAt: Date,
}, {
    timestamps: true
});

const Order = mongoose.model('Order', orderSchema, 'order');

module.exports = Order;