const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
    customerName: {
        type: String,
        required: true,
        trim: true
    },
    customerPhone: {
        type: String,
        required: true,
        trim: true
    },
    reservationDate: {
        type: Date,
        required: true
    },
    reservationTime: {
        type: String,
        required: true,
        trim: true
    },
    numberOfGuests: {
        type: Number,
        required: true,
        min: 1
    },
    specialRequests: {
        type: String,
        trim: true
    },
    restaurantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Restaurant',
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'cancelled'],
        default: 'pending'
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    expiredAt: {
        type: Date,
        required: true,
        default: function() {
            const date = new Date(this.reservationDate);
            date.setHours(this.reservationTime.split(':')[0]);
            date.setMinutes(this.reservationTime.split(':')[1]);
            return date;
        }
    },
    deleted: { 
        type: Boolean,
        default: false
    },
    deletedAt: Date,
}, {
    timestamps: true
});

const Reservation = mongoose.model('Reservation', reservationSchema, 'reservation');

module.exports = Reservation;