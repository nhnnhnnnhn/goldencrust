const { OpenAI } = require('openai');
const grokConfig = require('../../../config/grok');
const Restaurant = require('../models/restaurant.model');
const Table = require('../models/table.model');
const MenuItem = require('../models/menuItem.model');

class GrokService {
  constructor() {
    this.apiKey = grokConfig.GROK_API_KEY;
    this.apiUrl = grokConfig.GROK_API_URL;
    this.model = grokConfig.GROK_MODEL;
    this.defaultParams = grokConfig.defaultParams;
  }

  /**
   * Gọi Grok API để tạo phản hồi chatbot
   * @param {Array} messages - Mảng các tin nhắn theo định dạng {role, content}
   * @param {Object} params - Các tham số bổ sung cho API call
   * @returns {Promise<string>} - Phản hồi từ Grok
   */
  async createChatCompletion(messages, params = {}) {
    try {
      if (!this.apiKey) {
        console.warn('GROK_API_KEY chưa được thiết lập');
        return 'Xin lỗi, tôi không thể kết nối với dịch vụ AI.';
      }
      const client = new OpenAI({
        apiKey: this.apiKey,
        baseURL: this.apiUrl,
      });
      const completion = await client.chat.completions.create({
        model: this.model,
        messages: messages,
        ...this.defaultParams,
        ...params
      });
      if (completion.choices && completion.choices.length > 0 && completion.choices[0].message) {
        return completion.choices[0].message.content.trim();
      }
      throw new Error('Unexpected response format from Grok API');
    } catch (error) {
      console.error('Lỗi khi gọi Grok API:', error.message);
      if (error.response) {
        console.error('Chi tiết lỗi:', error.response.data);
      }
      throw new Error(`Lỗi Grok API: ${error.message}`);
    }
  }

  // Lấy thông tin động về nhà hàng, bàn trống, món ăn
  async getRestaurantPromptInfo(restaurantId = null) {
    try {
      let restaurant;
      if (restaurantId) {
        restaurant = await Restaurant.findOne({ _id: restaurantId, deleted: false });
      } else {
        restaurant = await Restaurant.findOne({ deleted: false });
      }
      // Lọc bàn trống theo đúng nhà hàng
      const tableQuery = { deleted: false, status: 'available' };
      if (restaurant) tableQuery.restaurantId = restaurant._id.toString();
      const availableTables = await Table.find(tableQuery);
      // Menu dùng chung - chỉ lấy 10 món mới nhất
      const menuItems = await MenuItem.find({ deleted: false, status: 'active' })
        .sort({ createdAt: -1 })
        .limit(10);

      let info = '';
      if (restaurant) {
        info += `Thông tin nhà hàng: ${restaurant.name}, Địa chỉ: ${restaurant.address}, SĐT: ${restaurant.phone}, Email: ${restaurant.email}.\n`;
      }
      if (availableTables && availableTables.length > 0) {
        info += `Bàn đang trống: ${availableTables.map(t => t.tableNumber).join(', ')}.\n`;
      } else {
        info += 'Hiện tại không có bàn nào đang trống.\n';
      }
      if (menuItems && menuItems.length > 0) {
        info += `Menu: ${menuItems.map(m => `${m.title} (${m.price}₫)`).join(', ')}.`;
      } else {
        info += 'Hiện tại chưa có món ăn nào.';
      }
      return info;
    } catch (err) {
      console.error('Lỗi khi lấy thông tin prompt động:', err.message);
      return '';
    }
  }

  /**
   * Xử lý tin nhắn từ người dùng và trả về phản hồi của chatbot
   * @param {string} message - Tin nhắn từ người dùng
   * @param {string} sessionId - ID của phiên trò chuyện
   * @param {Array} conversationHistory - Lịch sử trò chuyện
   * @param {Object} collectedData - Dữ liệu đã thu thập được từ trước
   * @param {string} restaurantId - ID của nhà hàng
   * @returns {Promise<Object>} - Trả về phản hồi, intent và dữ liệu thu thập được
   */
  async processMessage(message, sessionId, conversationHistory = [], collectedData = {}, restaurantId = null) {
    // Lấy thông tin động
    const extraInfo = await this.getRestaurantPromptInfo(restaurantId);
    const systemMessage = {
      role: 'system',
      content: `Bạn là trợ lý AI của nhà hàng Golden Crust. Hãy trả lời 1 cách aggressive (sẵn sàng chửi nhau), chính xác, bằng tiếng Việt.\n${extraInfo} `
    };
    const messages = [
      systemMessage,
      ...conversationHistory,
      { role: 'user', content: message }
    ];
    const reply = await this.createChatCompletion(messages);
    return {
      reply,
      intent: 'general',
      data: collectedData,
      sessionId
    };
  }
}

module.exports = new GrokService(); 