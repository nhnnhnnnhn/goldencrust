const mongoose = require('mongoose');

const orderDetailSchema = new mongoose.Schema({
    date: {
        type: Date,
        required: true,
        unique: true,
        validate: {
            validator: function(value) {
                // Ensure the date is today
                const today = new Date();
                return value.toDateString() === today.toDateString();
            },
            message: 'OrderDetail can only be created for today'
        }
    },
    restaurantId: {
        type: String,
        required: true
    },
    totalOrders: {
        type: Number,
        default: 0
    },
    dailyTotal: {
        type: Number,
        default: 0
    },
    paymentSummary: {
        cash: {
            count: { type: Number, default: 0 },
            total: { type: Number, default: 0 }
        },
        card: {
            count: { type: Number, default: 0 },
            total: { type: Number, default: 0 }
        }
    },
    orderTypeSummary: {
        dineIn: {
            count: { type: Number, default: 0 },
            total: { type: Number, default: 0 }
        },
        takeaway: {
            count: { type: Number, default: 0 },
            total: { type: Number, default: 0 }
        }
    }
}, {
    timestamps: true
});

const OrderDetail = mongoose.model('OrderDetail', orderDetailSchema, 'orderDetail');

module.exports = OrderDetail;