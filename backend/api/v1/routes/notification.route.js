const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notification.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// Create a new notification
router.post('/create', authMiddleware, notificationController.createNotification);

// Get notifications by ID
router.get('/:notificationId', authMiddleware, notificationController.getNotificationsById);

// Get notifications by user ID
router.get('/user/:userId', authMiddleware, notificationController.getNotificationsByUserId);

// Get notifications by guest ID
router.get('/guest/:guestId', authMiddleware, notificationController.getNotificationsByGuestId);

// Search notifications
router.get('/search', authMiddleware, notificationController.searchNotifications);

// Mark notification as read
router.patch('/read/:notificationId', authMiddleware, notificationController.markNotificationAsRead);

// Mark all notifications as read
router.patch('/read/all', authMiddleware, notificationController.markAllNotificationsAsRead);

// Delete notification
router.delete('/:notificationId', authMiddleware, notificationController.deleteNotification);

// Delete all notifications
router.delete('/all', authMiddleware, notificationController.deleteAllNotifications);

// Get notification count
router.get('/count', authMiddleware, notificationController.getNotificationsCount);

// Get unread notification count
router.get('/unread/count', authMiddleware, notificationController.getUnreadNotificationsCount);

module.exports = router;