const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
    {
        fullName: String,
        email: String,
        password: String,
        role: String,
        isVerified: {
            type: Boolean,
            default: false
        },
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