const mongoose = require('mongoose');
const generate =  require('../../../helpers/generate');
const menuItem = require('./menuItem.model');

const orderSchema = new mongoose.Schema({
    tableId: String,
    items: {
        menuItemId: String,
        quantity: Number,
        price: Number,
        discountPercentage: Number,
        total: Number,
    },
    totalAmount: Number,
    status: {
        type: String,
        enum: ['pending', 'completed', 'cancelled'],
        default: 'pending'
    },
    deleted: { 
        type: Boolean,
        default: false
    },
    deletedAt: Date,
    
});

const Order = mongoose.model('Order', orderSchema, 'order');

module.exports = Order;