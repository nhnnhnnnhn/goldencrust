const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    restaurantId: {
        type: String,
        required: true
    },
    orderDate: {
        type: Date,
        required: true,
        validate: {
            validator: function(value) {
                // Check if the order date is today
                const today = new Date();
                return value.toDateString() === today.toDateString();
            },
            message: 'Orders can only be placed for today'
        }
    },
    items: [{
        menuItemId: {
            type: String,
            required: true
        },
        quantity: {
            type: Number,
            required: true,
            min: 1
        },
        price: {
            type: Number,
            required: true,
            min: 0
        },
        total: {
            type: Number,
            required: true
        }
    }],
    orderType: {
        type: String,
        enum: ['Dine-in', 'Takeaway'],
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'cancelled'],
        default: 'pending'
    },
    totalAmount: {
        type: Number,
        required: true,
        min: 0
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