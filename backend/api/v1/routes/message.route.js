const express = require('express');
const router = express.Router();
const messageController = require('../controllers/message.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// Get messages by user ID
router.get('/user/:userId', authMiddleware, messageController.getMessagesByUserId);

// Get messages by guest ID
router.get('/guest/:guestId', authMiddleware, messageController.getMessagesByGuestId);

// Search messages
router.get('/search', authMiddleware, messageController.searchMessages);