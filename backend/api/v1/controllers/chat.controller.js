/**
 * Controller cho chatbot AI
 */
const Chat = require('../models/chat.model');
const User = require('../models/user.model');
const Reservation = require('../models/reservation.model');
const Order = require('../models/order.model');
const grokService = require('../services/grok.service');
const { v4: uuidv4 } = require('uuid');
const mongoose = require('mongoose');

/**
 * Khởi tạo phiên trò chuyện mới
 * @param {Object} req - Request
 * @param {Object} res - Response
 */
exports.initializeChat = async (req, res) => {
  try {
    // Tạo mới sessionId để đảm bảo không xảy ra lỗi
    const sessionId = uuidv4();
    
    // Chuẩn bị đối tượng chat và thông báo chào mừng
    const welcomeMessage = 'Xin chào! Tôi là trợ lý ảo của nhà hàng Golden Crust. Tôi có thể giúp gì cho bạn? Bạn có thể hỏi tôi về thực đơn, đặt bàn, đặt hàng hoặc thông tin về nhà hàng.';
    
    // Trả về thông tin ngay mà không đợi lưu vào database
    return res.status(200).json({
      success: true,
      data: {
        sessionId: sessionId,
        messages: [
          {
            role: 'assistant',
            content: welcomeMessage
          }
        ],
        intent: 'general'
      }
    });
  } catch (error) {
    console.error('Lỗi khi khởi tạo chat:', error);
    return res.status(500).json({
      success: false,
      message: 'Đã xảy ra lỗi khi khởi tạo phiên trò chuyện',
      error: error.message || 'Lỗi không xác định'
    });
  }
};

/**
 * Gửi tin nhắn và nhận phản hồi từ chatbot
 * @param {Object} req - Request
 * @param {Object} res - Response
 */
exports.sendMessage = async (req, res) => {
  try {
    // Kiểm tra thông tin đầu vào an toàn
    const message = req.body && req.body.message;
    const sessionId = req.body && req.body.sessionId;
    
    if (!message || !sessionId) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu thông tin tin nhắn hoặc ID phiên trò chuyện'
      });
    }
    
    // Bỏ qua bước suy nghĩ và phản hồi tạm thời
    // Trả về phản hồi ngay lập tức, không có thao tác trung gian
    
    // Tạo một hàm hỗ trợ để gửi từng phần của tin nhắn
    const sendPartialMessage = (text, isComplete = false, type = 'typing') => {
      if (global.io) {
        global.io.to(sessionId).emit('assistant_message', {
          type: type,
          content: text,
          isComplete: isComplete
        });
      }
    };

    // Trả về kết quả API trước để tránh timeout
    res.status(200).json({
      success: true,
      data: {
        sessionId,
        message: 'Xử lý yêu cầu của bạn...', 
        intent: 'general',
        streaming: true
      }
    });
    
    // Xử lý tin nhắn với trợ lý ảo trong quá trình async
    try {
      // Không cần delay thêm vì chúng ta đã có các tin nhắn tạm thời

      // Lấy lịch sử trò chuyện từ cache hoặc database
      let conversationHistory = [];
      let collectedData = {};
      
      try {
        // Tìm lịch sử trò chuyện trong database
        const chat = await Chat.findOne({ sessionId });
        
        if (chat) {
          // Nếu tìm thấy, lấy lịch sử của 5 tin nhắn gần nhất để tránh quá dài
          conversationHistory = chat.getConversationHistory().slice(-10); // Lấy 10 tin nhắn gần nhất
          collectedData = chat.collectedData || {};
          
          // Thêm tin nhắn mới của người dùng
          chat.addMessage('user', message);
          await chat.save();
        }
      } catch (dbError) {
        console.warn('Không thể lấy lịch sử trò chuyện:', dbError.message);
      }
      
      // Nếu không có lịch sử, tạo một lịch sử mới với tin nhắn chào hỏi
      if (conversationHistory.length === 0) {
        conversationHistory = [
          { role: 'assistant', content: 'Xin chào, tôi là trợ lý ảo của nhà hàng Golden Crust. Tôi có thể giúp gì cho bạn?' },
          { role: 'user', content: message }
        ];
      } else {
        // Thêm tin nhắn mới của người dùng vào lịch sử
        conversationHistory.push({ role: 'user', content: message });
      }
      
      // Gọi grok service với lịch sử hoàn chỉnh
      let reply = '';
      let intent = 'general';
      
      const response = await grokService.processMessage(
        message,
        sessionId,
        conversationHistory,
        collectedData
      );
      
      if (response && response.reply) {
        // Gửi từng ký tự của tin nhắn để mô phỏng typing
        reply = response.reply;
        intent = response.intent || 'general';
        
        // Phương pháp mới: gửi từng ký tự hoặc từ nhỏ nhất có thể để giảm độ trễ
        let partialReply = '';
        
        // Tách thành các ký tự đơn hoặc nhóm ký tự nhỏ để gửi
        const characters = reply.split('');
        const batchSize = 2; // Số ký tự gửi mỗi lần - hãy gọi càng ít càng tốt, nhưng phải cân nhắc hiệu suất
        
        // Bắt đầu gửi ngay lập tức ký tự đầu tiên để không phải chờ đợi
        if (characters.length > 0) {
          partialReply = characters[0];
          sendPartialMessage(partialReply, false, 'typing');
          await new Promise(resolve => setTimeout(resolve, 2)); // Chờ rất ngắn
        }
        
        // Gửi từng nhóm ký tự theo batch
        for (let i = 1; i < characters.length; i += batchSize) {
          const endIndex = Math.min(i + batchSize, characters.length);
          const batch = characters.slice(i, endIndex).join('');
          partialReply += batch;
          
          // Gửi ngay lập tức mà không chờ đợi
          sendPartialMessage(partialReply, false, 'typing');
          
          // Không chờ đợi hoặc chờ rất ít giữa các batch
          await new Promise(resolve => setTimeout(resolve, 2));
        }
        
        // Gửi tin nhắn hoàn chỉnh sau khi hoàn tất
        sendPartialMessage(reply, true, 'complete');
        
        // Lưu vào database nếu cần
        try {
          if (typeof Chat !== 'undefined' && Chat !== null) {
            const chat = await Chat.findOne({ sessionId });
            if (chat) {
              chat.addMessage('user', message);
              chat.addMessage('assistant', reply);
              chat.intent = intent;
              chat.lastActivity = new Date();
              await chat.save();
            }
          }
        } catch (dbError) {
          console.warn('Không thể lưu tin nhắn vào database:', dbError.message);
        }
      } else {
        // Nếu không có phản hồi, gửi thông báo lỗi
        sendPartialMessage('Xin lỗi, tôi không thể xử lý yêu cầu của bạn lúc này.', true, 'complete');
      }
    } catch (aiError) {
      console.error('Lỗi khi gọi Grok API:', aiError);
      // Tin nhắn lỗi cuối cùng
      sendPartialMessage('Tôi đang gặp khó khăn khi xử lý yêu cầu. Vui lòng thử lại sau hoặc liên hệ trực tiếp với nhà hàng.', true, 'complete');
    }
  } catch (error) {
    console.error('Lỗi khi xử lý tin nhắn:', error);
    // Nếu chưa trả về cho client, gửi thông báo lỗi
    if (!res.headersSent) {
      return res.status(500).json({
        success: false,
        message: 'Xử lý tin nhắn thất bại',
        error: error.message || 'Lỗi không xác định'
      });
    }
    
    // Gửi tin nhắn lỗi qua socket.io nếu có thể
    if (global.io && req.body && req.body.sessionId) {
      global.io.to(req.body.sessionId).emit('assistant_message', {
        type: 'error',
        content: 'Xử lý tin nhắn thất bại. Vui lòng thử lại.',
        isComplete: true
      });
    }
  }
};

/**
 * Lấy lịch sử trò chuyện
 * @param {Object} req - Request
 * @param {Object} res - Response
 */
exports.getChatHistory = async (req, res) => {
  try {
    const sessionId = req.params.sessionId;
    
    if (!sessionId) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu ID phiên trò chuyện'
      });
    }
    
    // Trả về lịch sử mặc định nếu không tìm thấy trong database
    return res.status(200).json({
      success: true,
      data: {
        sessionId,
        messages: [
          {
            role: 'assistant',
            content: 'Xin chào! Tôi là trợ lý ảo của nhà hàng Golden Crust. Tôi có thể giúp gì cho bạn?'
          }
        ],
        intent: 'general'
      }
    });
  } catch (error) {
    console.error('Lỗi khi lấy lịch sử chat:', error);
    return res.status(500).json({
      success: false,
      message: 'Không thể lấy lịch sử trò chuyện',
      error: error.message || 'Lỗi không xác định'
    });
  }
};

/**
 * Kết thúc phiên trò chuyện
 * @param {Object} req - Request
 * @param {Object} res - Response
 */
exports.endChat = async (req, res) => {
  try {
    const sessionId = req.params.sessionId;
    
    if (!sessionId) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu ID phiên trò chuyện'
      });
    }
    
    return res.status(200).json({
      success: true,
      message: 'Phiên trò chuyện đã kết thúc'
    });
  } catch (error) {
    console.error('Lỗi khi kết thúc chat:', error);
    return res.status(500).json({
      success: false,
      message: 'Không thể kết thúc phiên trò chuyện',
      error: error.message || 'Lỗi không xác định'
    });
  }
};

/**
 * Kiểm tra xem dữ liệu đặt bàn đã đầy đủ chưa
 * @param {Object} data - Dữ liệu đặt bàn
 * @returns {boolean} - true nếu đầy đủ thông tin
 */
function isReservationDataComplete(data) {
  if (!data) return false;
  return !!(data.name && data.date && data.time && data.guests);
}

/**
 * Kiểm tra xem dữ liệu đặt món đã đầy đủ chưa
 * @param {Object} data - Dữ liệu đặt món
 * @returns {boolean} - true nếu đầy đủ thông tin
 */
function isOrderDataComplete(data) {
  if (!data) return false;
  return !!(data.items && data.address && data.phone);
}
