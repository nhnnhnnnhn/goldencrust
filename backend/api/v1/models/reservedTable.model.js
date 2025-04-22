const mongoose = require('mongoose');

const reservedTableSchema = new mongoose.Schema({
    tableId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'table'
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    date: {
        type: Date,
        required: true
    },
    time: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['reserved', 'completed', 'cancelled'],
        default: 'reserved'
    }
}, {
    timestamps: true
});

const reservedTable = mongoose.model('reservedTable', reservedTableSchema, 'reservedTable');
module.exports = reservedTable;