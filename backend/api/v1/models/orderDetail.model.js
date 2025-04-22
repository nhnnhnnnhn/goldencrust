const mongoose = require('mongoose');

const orderDetailSchema = new mongoose.Schema({
    orderId: String,
    restaurantId: String,
    items: [{
        menuItemId: String,
        quantity: Number,
        price: Number,
        discountPercentage: Number,
        total: Number,
    }],
    totalAmount: Number,
    status: {
        type: String,
        enum: ['pending', 'completed', 'cancelled'],
        default: 'pending'
    },
    orderType: {
        type: String,
        enum: ['dine-in', 'takeaway', 'delivery'],
        default: 'dine-in'
    },
    deleted: { 
        type: Boolean,
        default: false
    },
    deletedAt: Date,
    
});

const orderDetail = mongoose.model('Order', orderDetailSchema, 'orderDetail');

module.exports = Order;