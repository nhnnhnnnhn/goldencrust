/**
 * Routes cho chatbot AI
 */
const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chat.controller');
const { authenticateOptional } = require('../middlewares/auth.middleware');

// Route khởi tạo chat (có thể không cần đăng nhập)
router.post('/initialize', authenticateOptional, chatController.initializeChat);

// Route gửi tin nhắn và nhận phản hồi
router.post('/message', authenticateOptional, chatController.sendMessage);

// Route lấy lịch sử chat
router.get('/:sessionId', authenticateOptional, chatController.getChatHistory);

// Route kết thúc phiên chat
router.put('/:sessionId/end', authenticateOptional, chatController.endChat);

module.exports = router;
