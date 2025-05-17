const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['user', 'assistant', 'system'],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const chatSchema = new mongoose.Schema({
  // ID người dùng (nếu đã đăng nhập)
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Session ID cho người dùng chưa đăng nhập
  sessionId: {
    type: String,
    required: true
  },
  
  // Mục đích của cuộc trò chuyện
  intent: {
    type: String,
    enum: ['reservation', 'order', 'menu_inquiry', 'restaurant_info', 'general'],
    default: 'general'
  },
  
  // Danh sách tin nhắn
  messages: [messageSchema],
  
  // Liên kết với đặt bàn (nếu có)
  reservationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Reservation'
  },
  
  // Liên kết với đơn hàng (nếu có)
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  },
  
  // Trạng thái của hội thoại
  status: {
    type: String,
    enum: ['active', 'completed', 'abandoned'],
    default: 'active'
  },
  
  // Trạng thái dữ liệu thu thập được
  collectedData: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  
  // Thời gian cuối cùng có tương tác
  lastActivity: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Phương thức thêm tin nhắn
chatSchema.methods.addMessage = function(role, content) {
  this.messages.push({
    role,
    content,
    timestamp: new Date()
  });
  
  this.lastActivity = new Date();
  return this;
};

// Phương thức lấy lịch sử trò chuyện cho DeepSeek API
chatSchema.methods.getConversationHistory = function(maxTokens = 4000) {
  const recentMessages = [...this.messages].reverse().slice(0, 20).reverse();
  
  return recentMessages.map(msg => ({
    role: msg.role,
    content: msg.content
  }));
};

const Chat = mongoose.model('Chat', chatSchema);

module.exports = Chat;
