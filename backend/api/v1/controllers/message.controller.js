const Message = require('../models/message.model');
const User = require('../models/user.model');
const Guest = require('../models/guest.model');
const mongoose = require('mongoose');

// Get messages by user ID
exports.getMessagesByUserId = async (req, res) => {
    try {
        const userId = req.params.userId;
        const messages = await Message.find({ userId: userId }).populate('guestId', 'name');
        res.status(200).json(messages);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving messages', error });
    }
};

// Get messages by guest ID
exports.getMessagesByGuestId = async (req, res) => {
    try {
        const guestId = req.params.guestId;
        const messages = await Message.find({ guestId: guestId }).populate('userId', 'name');
        res.status(200).json(messages);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving messages', error });
    }
};

// Search messages
exports.searchMessages = async (req, res) => {
    try {
        const { userId, guestId, searchTerm } = req.query;

        const query = {
            $or: [
                { userId: mongoose.Types.ObjectId(userId), message: { $regex: searchTerm, $options: 'i' } },
                { guestId: mongoose.Types.ObjectId(guestId), message: { $regex: searchTerm, $options: 'i' } }
            ]
        };

        const messages = await Message.find(query).populate('userId', 'name').populate('guestId', 'name');
        res.status(200).json(messages);
    } catch (error) {
        res.status(500).json({ message: 'Error searching messages', error });
    }
};