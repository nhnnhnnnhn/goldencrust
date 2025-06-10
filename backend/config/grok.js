/**
 * Cấu hình Grok (xAI) API cho chatbot AI
 */
require('dotenv').config();

const GROK_API_KEY = process.env.GROK_API_KEY || '';
console.log('GROK_API_KEY có được đặt:', GROK_API_KEY ? 'Có (không hiển thị giá trị để bảo mật)' : 'Không');

const GROK_API_URL = 'https://api.x.ai/v1';
const GROK_MODEL = 'grok-3-fast-beta';

const defaultParams = {
  temperature: 0.7,
  max_tokens: 1024,
  top_p: 0.95,
  frequency_penalty: 0,
  presence_penalty: 0
};

module.exports = {
  GROK_API_KEY,
  GROK_API_URL,
  GROK_MODEL,
  defaultParams
}; 