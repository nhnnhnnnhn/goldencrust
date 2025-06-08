const mongoose = require('mongoose');

const tableSchema = new mongoose.Schema({
    restaurantId: {
        type: String,
        required: true
    },
    tableNumber: {
        type: String,
        required: true
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
    deleted: { 
        type: Boolean,
        default: false
    }
}, {
    timestamps: false
});

// Tạo compound index để đảm bảo tableNumber unique trong một nhà hàng
tableSchema.index({ restaurantId: 1, tableNumber: 1 }, { unique: true });

const Table = mongoose.model('Table', tableSchema, 'table');

module.exports = Table;