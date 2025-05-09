const Notification = require('../models/notification.model');
const User = require('../models/user.model');
const Guest = require('../models/guest.model');
const mongoose = require('mongoose');

// Get notifications by ID
exports.getNotificationsById = async (req, res) => {
    try {
        const notificationId = req.params.notificationId;
        const notification = await Notification.findById(notificationId);
        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }
        res.status(200).json(notification);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving notification', error });
    }
};

// Get notifications by user ID
exports.getNotificationsByUserId = async (req, res) => {
    try {
        const userId = req.params.userId;
        const notifications = await Notification.find({ userId: userId }).populate('guestId', 'name');
        res.status(200).json(notifications);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving notifications', error });
    }
};

// Get notifications by guest ID
exports.getNotificationsByGuestId = async (req, res) => {
    try {
        const guestId = req.params.guestId;
        const notifications = await Notification.find({ guestId: guestId }).populate('userId', 'name');
        res.status(200).json(notifications);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving notifications', error });
    }
};

// Search notifications
exports.searchNotifications = async (req, res) => {
    try {
        const { userId, guestId, searchTerm } = req.query;

        const query = {
            $or: [
                { userId: mongoose.Types.ObjectId(userId), message: { $regex: searchTerm, $options: 'i' } },
                { guestId: mongoose.Types.ObjectId(guestId), message: { $regex: searchTerm, $options: 'i' } }
            ]
        };

        const notifications = await Notification.find(query).populate('userId', 'name').populate('guestId', 'name');
        res.status(200).json(notifications);
    } catch (error) {
        res.status(500).json({ message: 'Error searching notifications', error });
    }
};

// Mark notification as read
exports.markNotificationAsRead = async (req, res) => {
    try {
        const notificationId = req.params.notificationId;
        const notification = await Notification.findByIdAndUpdate(notificationId, { read: true }, { new: true });
        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }
        res.status(200).json(notification);
    } catch (error) {
        res.status(500).json({ message: 'Error marking notification as read', error });
    }
};

// Mark all notifications as read
exports.markAllNotificationsAsRead = async (req, res) => {
    try {
        const userId = req.body.userId;
        const notifications = await Notification.updateMany({ userId: userId }, { read: true });
        res.status(200).json({ message: 'All notifications marked as read', notifications });
    } catch (error) {
        res.status(500).json({ message: 'Error marking all notifications as read', error });
    }
};

// Delete notification
exports.deleteNotification = async (req, res) => {
    try {
        const notificationId = req.params.notificationId;
        const notification = await Notification.findByIdAndDelete(notificationId);
        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }
        res.status(200).json({ message: 'Notification deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting notification', error });
    }
};

// Delete all notifications
exports.deleteAllNotifications = async (req, res) => {
    try {
        const userId = req.body.userId;
        await Notification.deleteMany({ userId: userId });
        res.status(200).json({ message: 'All notifications deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting all notifications', error });
    }
};

// Get notifications count
exports.getNotificationsCount = async (req, res) => {
    try {
        const userId = req.params.userId;
        const count = await Notification.countDocuments({ userId: userId });
        res.status(200).json({ count });
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving notifications count', error });
    }
};

// Get unread notifications count
exports.getUnreadNotificationsCount = async (req, res) => {
    try {
        const userId = req.params.userId;
        const count = await Notification.countDocuments({ userId: userId, read: false });
        res.status(200).json({ count });
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving unread notifications count', error });
    }
};