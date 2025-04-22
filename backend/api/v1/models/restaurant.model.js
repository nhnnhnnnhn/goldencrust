const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema({
    address: {
        type: String,
        required: true,
        trim: true
    },
    tableNumber: {
        type: Number,
        required: true,
        min: 1
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