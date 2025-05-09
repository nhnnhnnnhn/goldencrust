// Sử dụng biến môi trường hoặc fallback vào localhost nếu không có
// Backend đang chạy trên port 5000 theo cấu hình trong file .env của backend
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

export const getAuthHeaders = (token: string) => ({
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  }
});
