const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
    {
        fullName: String,
        email: String,
        password: String,
        role: {
            type: String,
            enum: ['admin', 'employee', 'user'],
            default: 'user'
        },
        isVerified: {
            type: Boolean,
            default: false
        },
        avatar: String,
        isActive: Boolean,
        isSuspended: {
            type: Boolean,
            default: false
        },
        lastLogin: Date,
        address: String,
        phone: String,
        deleted: {
            type: Boolean,
            default: false
        },
        deletedAt: Date
    },
    {timestamps: true}
)

const User = mongoose.model('User', userSchema, 'user');

module.exports = User;