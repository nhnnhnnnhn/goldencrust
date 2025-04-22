const mongoose = require('mongoose');

const tableSchema = new mongoose.Schema({
    restaurantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'restaurant'
    },
    tableNumber: {
        type: String,
        required: true,
        unique: true
    },
    capacity: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['available', 'reserved', 'occupied'],
        default: 'available'
    },
    location: {
        type: String,
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

const Table = mongoose.model('Table', tableSchema, 'table');
module.exports = Table;