const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    address: {
        type: String,
        required: true,
        trim: true
    },
    phone: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true
    },
    tableNumber: {
        type: Number,
        required: true,
        min: 1
    },
    status: {
        type: String,
        enum: ['open', 'closed'],
        default: 'open'
    },
    deleted: { 
        type: Boolean,
        default: false
    },
    deletedAt: Date,
}, {
    timestamps: true
});

const Restaurant = mongoose.model('Restaurant', restaurantSchema, 'restaurant');

module.exports = Restaurant;