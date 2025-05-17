/**
 * Dịch vụ kết nối với DeepSeek API
 */
const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Sử dụng try-catch khi import để tránh crash
let DEEPSEEK_API_KEY, DEEPSEEK_API_URL, DEEPSEEK_MODEL, defaultParams;
try {
  const deepseekConfig = require('../../../config/deepseek');
  DEEPSEEK_API_KEY = deepseekConfig.DEEPSEEK_API_KEY;
  DEEPSEEK_API_URL = deepseekConfig.DEEPSEEK_API_URL;
  DEEPSEEK_MODEL = deepseekConfig.DEEPSEEK_MODEL;
  defaultParams = deepseekConfig.defaultParams;
} catch (error) {
  console.error('Lỗi khi load cấu hình DeepSeek:', error.message);
  // Thiết lập giá trị mặc định
  DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || '';
  DEEPSEEK_API_URL = 'https://api.deepseek.com/v1';
  DEEPSEEK_MODEL = 'deepseek-chat';
  defaultParams = {
    temperature: 0.7,
    max_tokens: 1024,
    top_p: 0.95,
    frequency_penalty: 0,
    presence_penalty: 0
  };
}

class DeepSeekService {
  constructor() {
    this.apiKey = DEEPSEEK_API_KEY;
    this.apiUrl = DEEPSEEK_API_URL;
    this.model = DEEPSEEK_MODEL;
    this.defaultParams = defaultParams;
    
    try {
      // Kiểm tra xem thư mục prompt có tồn tại không
      this.promptsPath = path.join(__dirname, '../../../chatbot/prompts');
      if (!fs.existsSync(this.promptsPath)) {
        console.warn(`Thư mục prompt không tồn tại: ${this.promptsPath}`);
        fs.mkdirSync(this.promptsPath, { recursive: true });
        console.log(`Đã tạo thư mục prompt tại ${this.promptsPath}`);
      }
      
      // Đọc các file prompt
      this.prompts = {
        base: this.readPromptFile('base-prompt.txt'),
        reservation: this.readPromptFile('reservation-prompt.txt'),
        order: this.readPromptFile('order-prompt.txt'),
        menu: this.readPromptFile('menu-prompt.txt'),
        info: this.readPromptFile('info-prompt.txt')
      };
    } catch (error) {
      console.error('Lỗi khi khởi tạo prompts:', error.message);
      // Tạo prompts mặc định nếu có lỗi
      this.prompts = {
        base: "Bạn là trợ lý AI của nhà hàng Golden Crust",
        reservation: "Hỗ trợ đặt bàn",
        order: "Hỗ trợ đặt hàng",
        menu: "Thông tin về menu",
        info: "Thông tin về nhà hàng"
      };
    }
  }

  /**
   * Đọc nội dung file prompt
   * @param {string} filename - Tên file prompt
   * @returns {string} - Nội dung file prompt
   */
  readPromptFile(filename) {
    try {
      const promptPath = path.join(this.promptsPath, filename);
      if (fs.existsSync(promptPath)) {
        return fs.readFileSync(promptPath, 'utf8');
      } else {
        console.warn(`File prompt ${filename} không tồn tại tại đường dẫn ${promptPath}`);
        return `[Default prompt for ${filename}]`;
      }
    } catch (error) {
      console.error(`Lỗi khi đọc file prompt ${filename}:`, error);
      return `[Default prompt for ${filename}]`;
    }
  }

  /**
   * Gọi API DeepSeek để tạo phản hồi chatbot
   * @param {Array} messages - Mảng các tin nhắn theo định dạng {role, content}
   * @param {Object} params - Các tham số bổ sung cho API call
   * @param {Object} options - Tùy chọn khác như timeout, signal, v.v.
   * @returns {Promise<string>} - Phản hồi từ DeepSeek
   */
  async createChatCompletion(messages, params = {}, options = {}) {
    try {
      // Kiểm tra API key
      if (!this.apiKey) {
        console.warn('DEEPSEEK_API_KEY chưa được thiết lập');
        return "Xin lỗi, tôi không thể kết nối với dịch vụ AI. Vui lòng liên hệ với nhà hàng qua số điện thoại.";
      }
      
      // Kết hợp các tham số mặc định và tham số được truyền vào
      const requestParams = {
        ...this.defaultParams,
        ...params
      };

      // Chuẩn bị dữ liệu yêu cầu
      const requestData = {
        model: this.model,
        messages: messages,
        ...requestParams
      };

      // Tùy chọn cho API call
      const axiosOptions = {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        // Thêm các tùy chọn timeout và signal nếu có
        ...(options.timeout ? { timeout: options.timeout } : {}),
        ...(options.signal ? { signal: options.signal } : {})
      };
      
      // Gọi DeepSeek API với timeout và signal nếu có
      const response = await axios.post(
        `${this.apiUrl}/chat/completions`,
        requestData,
        axiosOptions
      );

      // Trả về phản hồi
      if (response.data && response.data.choices && response.data.choices.length > 0) {
        return response.data.choices[0].message.content;
      } else {
        throw new Error('Không nhận được phản hồi hợp lệ từ DeepSeek API');
      }
    } catch (error) {
      console.error('Lỗi khi gọi DeepSeek API:', error.message);
      if (error.response) {
        console.error('Chi tiết lỗi:', error.response.data);
      }
      throw new Error(`Lỗi DeepSeek API: ${error.message}`);
    }
  }
  
  /**
   * Xử lý tin nhắn từ người dùng và trả về phản hồi của chatbot
   * @param {string} message - Tin nhắn từ người dùng
   * @param {string} sessionId - ID của phiên trò chuyện
   * @param {Array} conversationHistory - Lịch sử trò chuyện
   * @param {Object} collectedData - Dữ liệu đã thu thập được từ trước
   * @returns {Promise<Object>} - Trả về phản hồi, intent và dữ liệu thu thập được
   */
  async processMessage(message, sessionId, conversationHistory = [], collectedData = {}) {
    try {
      // Phân tích intent (mục đích) của tin nhắn trước khi gọi API
      const intent = this.analyzeIntent(message, collectedData) || 'general';
      
      // Tạo một phản hồi nhanh để trả về ngay lập tức cho client
      let updatedData = { ...collectedData };
      
      // Tạo prompt nhanh dựa trên intent
      let prompt;
      try {
        switch (intent) {
          case 'reservation':
            prompt = this.prompts.reservation || this.prompts.base;
            break;
          case 'order':
            prompt = this.prompts.order || this.prompts.base;
            break;
          case 'menu':
            prompt = this.prompts.menu || this.prompts.base;
            break;
          case 'info':
            prompt = this.prompts.info || this.prompts.base;
            break;
          default:
            prompt = this.prompts.base;
        }
      } catch (promptError) {
        console.warn('Lỗi khi đọc prompt:', promptError.message);
        prompt = "Bạn là trợ lý AI của nhà hàng Golden Crust";
      }
      
      // Tạo phản hồi nhanh - đây là phản hồi ban đầu, sẽ được gửi ngay lập tức
      const fastResponse = {
        reply: `Tôi đang xử lý yêu cầu của bạn: "${message.substring(0, 50)}${message.length > 50 ? '...' : ''}"`,
        intent: intent,
        data: updatedData,
        sessionId: sessionId
      };

      // Tạo một phiên bản ngắn gọn của lịch sử trò chuyện để giảm tải
      const optimizedHistory = conversationHistory.length > 10 
        ? [...conversationHistory.slice(0, 2), ...conversationHistory.slice(-8)]
        : conversationHistory;
      
      // Tạo messages cho API call
      const messages = [
        { role: 'system', content: prompt },
        ...optimizedHistory
      ];
      
      // Tạo timeout controller để tránh chờ quá lâu
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000); // 3s timeout
      
      // Gọi API với Promise để không block luồng chính
      try {
        // Trả về fastResponse trước để client có thể hiển thị ngay
        const apiResponse = await Promise.race([
          this.createChatCompletion(messages, {}, { signal: controller.signal, timeout: 3000 }),
          // Fallback sau 3 giây nếu API quá chậm
          new Promise((_, reject) => setTimeout(() => reject(new Error('API Timeout')), 3000))
        ]);
        
        // Xóa timeout để tránh memory leak
        clearTimeout(timeoutId);
        
        // Trả về kết quả từ API
        return {
          reply: apiResponse || fastResponse.reply,
          intent: intent,
          data: updatedData,
          sessionId: sessionId
        };
      } catch (apiError) {
        // Xóa timeout để tránh memory leak
        clearTimeout(timeoutId);
        console.warn('Lỗi khi gọi API, sử dụng phản hồi nhanh:', apiError.message);
        
        // Nếu có lỗi, trả về phản hồi nhanh theo intent đã phát hiện
        let fallbackReply = 'Tôi sẽ trả lời bạn ngay!'; 
        
        switch (intent) {
          case 'reservation':
            fallbackReply = 'Tôi hiểu bạn muốn đặt bàn. Vui lòng cho tôi biết ngày, giờ và số lượng khách để tôi giúp bạn.';
            break;
          case 'order':
            fallbackReply = 'Bạn muốn đặt món? Vui lòng cho tôi biết các món ăn bạn muốn đặt.';
            break;
          case 'menu':
            fallbackReply = 'Chúng tôi có nhiều món ăn đa dạng, từ các món Việt truyền thống đến các món Âu Mỹ hiện đại. Bạn muốn ăn loại món nào?';
            break;
        }
        
        return {
          reply: fallbackReply,
          intent: intent,
          data: updatedData,
          sessionId: sessionId
        };
      }
    } catch (error) {
      console.error('Lỗi nghiêm trọng khi xử lý tin nhắn:', error);
      return {
        reply: 'Xin lỗi, hệ thống đang gặp trục trặc. Hãy thử lại trong giây lát.',
        intent: 'general',
        data: collectedData || {},
        sessionId: sessionId
      };
    }
  }
  
  /**
   * Phân tích intent (mục đích) của tin nhắn
   * @param {string} message - Tin nhắn của người dùng
   * @param {Object} currentData - Dữ liệu hiện tại
   * @returns {string} - Intent nhận dạng được
   */
  analyzeIntent(message, currentData = {}) {
    // Tin nhắn ngắn
    const lowercaseMessage = message.toLowerCase();
    
    // Các từ khóa để phân loại intent
    const keywords = {
      reservation: ['đặt bàn', 'đặt chỗ', 'reservation', 'đặt trước', 'bàn trống', 'đặt ăn', 'chỗ ngồi'],
      order: ['đặt món', 'đặt đồ ăn', 'giao hàng', 'delivery', 'order', 'thực đơn đặt hàng', 'món ăn'],
      menu: ['menu', 'thực đơn', 'món ăn', 'món nào', 'đồ ăn', 'có món gì', 'đặc sản'],
      info: ['giờ mở cửa', 'địa chỉ', 'liên hệ', 'về nhà hàng', 'thông tin', 'parking', 'đỗ xe', 'giá cả']
    };
    
    // Kiểm tra intent trước đó nếu có
    if (currentData && currentData.intent && 'reservation' === currentData.intent) {
      // Nếu đang trong quá trình đặt bàn và chưa hoàn tất, giữ intent
      const reservationFields = ['name', 'date', 'time', 'guests'];
      for (const field of reservationFields) {
        if (!currentData[field]) {
          return 'reservation'; // Vẫn còn thiếu thông tin đặt bàn
        }
      }
    }
    
    if (currentData && currentData.intent && 'order' === currentData.intent) {
      // Nếu đang trong quá trình đặt món và chưa hoàn tất, giữ intent
      const orderFields = ['items', 'address', 'phone'];
      for (const field of orderFields) {
        if (!currentData[field]) {
          return 'order'; // Vẫn còn thiếu thông tin đặt món
        }
      }
    }
    
    // Kiểm tra các từ khóa trong tin nhắn
    for (const [intent, keywordList] of Object.entries(keywords)) {
      for (const keyword of keywordList) {
        if (lowercaseMessage.includes(keyword)) {
          return intent;
        }
      }
    }
    
    // Mặc định là general nếu không tìm thấy intent cụ thể
    return 'general';
  }

  /**
   * Trích xuất thông tin từ phản hồi của người dùng
   * @param {string} userMessage - Tin nhắn của người dùng
   * @param {string} extractionType - Loại thông tin cần trích xuất (reservation, order, etc.)
   * @param {Object} currentData - Dữ liệu đã thu thập được trước đó
   * @returns {Promise<Object>} - Thông tin đã trích xuất
   */
  async extractInformation(userMessage, extractionType, currentData = {}) {
    try {
      // Tạo prompt để trích xuất thông tin
      let systemPrompt = '';
      
      switch(extractionType) {
        case 'reservation':
          systemPrompt = `Trích xuất thông tin đặt bàn từ tin nhắn của người dùng. Trả về JSON với các trường: 
          customerName, phoneNumber, reservationDate, reservationTime, numberOfGuests, specialRequests.
          Chỉ trả về các trường có thông tin, bỏ qua các trường không có thông tin. 
          Định dạng ngày: YYYY-MM-DD. Định dạng giờ: HH:MM.`;
          break;
        case 'order':
          systemPrompt = `Trích xuất thông tin đặt hàng từ tin nhắn của người dùng. Trả về JSON với các trường: 
          customerName, phoneNumber, deliveryAddress, items (array của {itemName, quantity}), paymentMethod, specialInstructions.
          Chỉ trả về các trường có thông tin, bỏ qua các trường không có thông tin.`;
          break;
        default:
          systemPrompt = `Trích xuất thông tin từ tin nhắn của người dùng. Trả về JSON với các thông tin liên quan.`;
      }
      
      // Thêm thông tin về dữ liệu hiện có
      let currentDataPrompt = '';
      if (Object.keys(currentData).length > 0) {
        currentDataPrompt = `Thông tin đã thu thập được: ${JSON.stringify(currentData)}. Chỉ cập nhật các trường mới hoặc có thay đổi.`;
      }
      
      const messages = [
        { role: 'system', content: systemPrompt + ' ' + currentDataPrompt },
        { role: 'user', content: userMessage }
      ];
      
      // Gọi DeepSeek API với chế độ JSON
      const requestParams = {
        temperature: 0.1, // Nhiệt độ thấp để có kết quả nhất quán
        response_format: { type: 'json_object' }
      };
      
      const response = await this.createChatCompletion(messages, requestParams);
      
      // Parse JSON từ phản hồi
      try {
        const extractedData = JSON.parse(response);
        return {
          ...currentData,
          ...extractedData
        };
      } catch (jsonError) {
        console.error('Lỗi khi phân tích JSON:', jsonError);
        return currentData;
      }
    } catch (error) {
      console.error('Lỗi khi trích xuất thông tin:', error);
      return currentData;
    }
  }

  /**
   * Phát hiện ý định (intent) từ tin nhắn người dùng
   * @param {string} userMessage - Tin nhắn của người dùng
   * @returns {Promise<string>} - Intent phát hiện được
   */
  async detectIntent(userMessage) {
    try {
      const messages = [
        {
          role: 'system',
          content: `Phân tích tin nhắn của người dùng và xác định ý định. Trả về một trong các giá trị sau:
            - reservation: Nếu người dùng muốn đặt bàn, kiểm tra đặt bàn, hủy đặt bàn.
            - order: Nếu người dùng muốn đặt hàng, kiểm tra đơn hàng, hủy đơn hàng.
            - menu_inquiry: Nếu người dùng hỏi về menu, món ăn, giá cả, v.v.
            - restaurant_info: Nếu người dùng hỏi về nhà hàng, địa chỉ, giờ mở cửa, v.v.
            - general: Cho các câu hỏi chung hoặc trò chuyện thông thường.
            Chỉ trả về một giá trị duy nhất, không kèm giải thích.`
        },
        { role: 'user', content: userMessage }
      ];

      // Gọi DeepSeek API với nhiệt độ thấp để có kết quả nhất quán
      const response = await this.createChatCompletion(messages, { temperature: 0.1 });
      
      // Chuẩn hóa phản hồi
      const intent = response.trim().toLowerCase();
      
      // Kiểm tra xem intent có hợp lệ không
      const validIntents = ['reservation', 'order', 'menu_inquiry', 'restaurant_info', 'general'];
      if (validIntents.includes(intent)) {
        return intent;
      } else {
        return 'general';
      }
    } catch (error) {
      console.error('Lỗi khi phát hiện intent:', error);
      return 'general';
    }
  }

  /**
   * Xử lý tin nhắn và tạo phản hồi dựa trên intent
   * @param {string} userMessage - Tin nhắn người dùng
   * @param {string} sessionId - ID phiên trò chuyện
   * @param {Array} conversationHistory - Lịch sử trò chuyện
   * @param {Object} collectedData - Dữ liệu đã thu thập được
   * @returns {Promise<Object>} - Phản hồi và thông tin phiên trò chuyện
   */
  async processMessage(userMessage, sessionId, conversationHistory = [], collectedData = {}) {
    try {
      // Phát hiện intent
      const detectedIntent = await this.detectIntent(userMessage);
      
      // Chuẩn bị prompt dựa trên intent
      let systemPrompt = this.prompts.base;
      
      switch(detectedIntent) {
        case 'reservation':
          systemPrompt = systemPrompt + '\n\n' + this.prompts.reservation;
          break;
        case 'order':
          systemPrompt = systemPrompt + '\n\n' + this.prompts.order;
          break;
        case 'menu_inquiry':
          systemPrompt = systemPrompt + '\n\n' + this.prompts.menu;
          break;
        case 'restaurant_info':
          systemPrompt = systemPrompt + '\n\n' + this.prompts.info;
          break;
      }
      
      // Nếu có dữ liệu đã thu thập, thêm vào prompt
      if (detectedIntent === 'reservation' || detectedIntent === 'order') {
        if (Object.keys(collectedData).length > 0) {
          systemPrompt += `\n\nTHÔNG TIN ĐÃ THU THẬP:\n${JSON.stringify(collectedData, null, 2)}`;
        }
        
        // Cập nhật dữ liệu đã thu thập
        collectedData = await this.extractInformation(userMessage, detectedIntent, collectedData);
      }
      
      // Chuẩn bị tin nhắn
      const messages = [
        { role: 'system', content: systemPrompt }
      ];
      
      // Thêm lịch sử hội thoại (giới hạn để tránh quá dài)
      const limitedHistory = conversationHistory.slice(-10);
      messages.push(...limitedHistory);
      
      // Thêm tin nhắn mới của người dùng
      messages.push({ role: 'user', content: userMessage });
      
      // Gọi DeepSeek API để tạo phản hồi
      const response = await this.createChatCompletion(messages);
      
      return {
        reply: response,
        intent: detectedIntent,
        collectedData: collectedData,
        sessionId: sessionId
      };
    } catch (error) {
      console.error('Lỗi khi xử lý tin nhắn:', error);
      return {
        reply: 'Xin lỗi, hiện tại hệ thống đang gặp sự cố. Vui lòng thử lại sau hoặc liên hệ trực tiếp với nhà hàng qua số điện thoại 028-1234-5678.',
        intent: 'general',
        collectedData: collectedData,
        sessionId: sessionId,
        error: error.message
      };
    }
  }
}

module.exports = new DeepSeekService();
