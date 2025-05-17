/**
 * Cấu hình DeepSeek API cho chatbot AI
 */
require('dotenv').config();

// Kiểm tra xem dotenv đã được kích hoạt chưa
console.log('Kiểm tra các biến môi trường đã được nạp:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PORT:', process.env.PORT);

// Các biến môi trường
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || '';
console.log('DEEPSEEK_API_KEY có được đặt:', DEEPSEEK_API_KEY ? 'Có (không hiển thị giá trị để bảo mật)' : 'Không');

const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1';
const DEEPSEEK_MODEL = 'deepseek-chat'; // Thay đổi theo model cụ thể bạn muốn sử dụng

// Thông số mặc định cho API
const defaultParams = {
  temperature: 0.7,
  max_tokens: 1024,
  top_p: 0.95,
  frequency_penalty: 0,
  presence_penalty: 0
};

module.exports = {
  DEEPSEEK_API_KEY,
  DEEPSEEK_API_URL,
  DEEPSEEK_MODEL,
  defaultParams
};
