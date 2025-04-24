const mongoose = require('mongoose');

const tokenSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    token: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    expiresAt: {
        type: Date,
        required: true,
    },
    isRevoked: {
        type: Boolean,
        default: false,
    },
    revokedAt: {
        type: Date,
    },
    createdByIp: {
        type: String,
    },
    revokedByIp: {
        type: String,
    }
}, {
    timestamps: true,
});

const Token = mongoose.model('Token', tokenSchema);
module.exports = Token;