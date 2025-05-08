# Golden Crust - Hệ thống Quản lý Nhà hàng

## 1. Giới thiệu bài toán

Golden Crust là một hệ thống quản lý nhà hàng toàn diện được thiết kế để tối ưu hóa các hoạt động hàng ngày của nhà hàng và nâng cao trải nghiệm khách hàng. Hệ thống giải quyết các thách thức sau:

### Vấn đề

- **Quản lý đặt bàn thủ công:** Nhà hàng hiện đang sử dụng phương pháp ghi chép thủ công gây ra lỗi và dư thừa nhân lực.
- **Xử lý đơn hàng không hiệu quả:** Thiếu hệ thống kỹ thuật số làm chậm quá trình từ đặt món đến phục vụ.
- **Theo dõi thanh toán phức tạp:** Khó khăn trong việc quản lý các hình thức thanh toán khác nhau và báo cáo doanh thu.
- **Phản hồi khách hàng hạn chế:** Không có cách hiệu quả để thu thập và phân tích phản hồi của khách hàng.
- **Quản lý nhân viên không hiệu quả:** Khó khăn trong việc quản lý ca làm việc và theo dõi hiệu suất.

### Giải pháp

Golden Crust cung cấp một nền tảng tích hợp với các tính năng:

- **Hệ thống đặt bàn trực tuyến:** Cho phép khách hàng dễ dàng đặt bàn trực tuyến với xác nhận tự động.
- **Quản lý menu kỹ thuật số:** Quản lý dễ dàng menu, danh mục và giá cả với cập nhật theo thời gian thực.
- **Xử lý đơn hàng tự động:** Quản lý liền mạch từ đặt món đến thanh toán.
- **Tích hợp thanh toán Stripe:** Hỗ trợ thanh toán an toàn và tiện lợi qua Stripe.
- **Quản lý nhà hàng:** Công cụ toàn diện để quản lý nhân viên, bàn, và hoạt động hàng ngày.
- **Báo cáo và phân tích:** Cung cấp thông tin chi tiết về doanh thu, hiệu suất và xu hướng khách hàng.

## 2. Giới thiệu thư viện, công cụ

### Backend

Golden Crust sử dụng kiến trúc backend mạnh mẽ dựa trên:

- **Node.js & Express:** Framework server mạnh mẽ và linh hoạt để xây dựng API.
- **MongoDB:** Cơ sở dữ liệu NoSQL để lưu trữ dữ liệu nhà hàng một cách linh hoạt.
- **Mongoose:** ODM (Object Data Modeling) để tương tác với MongoDB.
- **JSON Web Tokens (JWT):** Xác thực và phân quyền người dùng an toàn.
- **Bcrypt:** Mã hóa mật khẩu.
- **Stripe API:** Xử lý thanh toán trực tuyến an toàn.
- **Cloudinary:** Quản lý và lưu trữ hình ảnh.
- **Nodemailer:** Gửi email xác nhận và thông báo.
- **Express Validator:** Xác thực dữ liệu đầu vào.
- **Multer:** Xử lý upload file.

### Frontend

Giao diện người dùng hiện đại và đáp ứng được xây dựng với:

- **Next.js:** Framework React hiện đại với server-side rendering và routing.
- **TypeScript:** Siêu tập hợp của JavaScript với hệ thống kiểu tĩnh.
- **Tailwind CSS:** Framework CSS tiện ích để thiết kế UI nhanh chóng.
- **Shadcn/ui:** Thư viện UI components có thể tùy chỉnh cao.
- **React Hook Form:** Quản lý form hiệu quả với validation.
- **Stripe Elements:** Components UI cho thanh toán qua Stripe.
- **React Query:** Quản lý state server-side và caching.
- **Context API:** Quản lý state toàn cầu.

## 3. Cài đặt & triển khai

### Yêu cầu hệ thống

- Node.js (v18 hoặc cao hơn)
- MongoDB (v5 hoặc cao hơn)
- npm hoặc pnpm (khuyến nghị pnpm cho frontend)

### Cài đặt

1. **Clone repository:**
   ```bash
   git clone https://github.com/your-username/goldencrust.git
   cd goldencrust
   ```

2. **Cài đặt dependencies backend:**
   ```bash
   cd backend
   npm install
   ```

3. **Cài đặt dependencies frontend:**
   ```bash
   cd ../frontend
   pnpm install
   ```

4. **Cấu hình biến môi trường:**
   - Tạo file `.env` trong thư mục `backend` dựa trên `.env.example`
   - Điền thông tin cần thiết, đặc biệt là MongoDB URI và Stripe API keys

5. **Thiết lập Stripe:**
   - Đăng ký tài khoản Stripe tại [stripe.com](https://stripe.com)
   - Lấy API keys (test hoặc live) từ dashboard
   - Cấu hình webhook endpoint trong Stripe Dashboard trỏ đến `/api/v1/payments/webhook`
   - Sao chép Webhook Secret vào biến môi trường `STRIPE_WEBHOOK_SECRET`

### Chạy ứng dụng

1. **Khởi động backend:**
   ```bash
   cd backend
   npm start
   ```

2. **Khởi động frontend:**
   ```bash
   cd frontend
   pnpm dev
   ```

3. **Truy cập ứng dụng:**
   - Backend API: http://localhost:5000
   - Frontend: http://localhost:3000

### Triển khai

#### Triển khai backend

1. **Triển khai lên VPS hoặc cloud provider:**
   - Cấu hình Nginx làm reverse proxy
   - Sử dụng PM2 để quản lý tiến trình Node.js

   ```bash
   npm install -g pm2
   pm2 start server.js --name "goldencrust-backend"
   ```

2. **Triển khai lên dịch vụ như Heroku:**
   - Đảm bảo file `Procfile` tồn tại với nội dung:
     ```
     web: node server.js
     ```
   - Triển khai bằng Git

#### Triển khai frontend

1. **Build ứng dụng Next.js:**
   ```bash
   cd frontend
   pnpm build
   ```

2. **Triển khai lên dịch vụ như Vercel (khuyến nghị cho Next.js):**
   - Kết nối repository với Vercel
   - Cấu hình biến môi trường
   - Triển khai tự động

### Cấu hình Webhook Stripe

1. Sử dụng Stripe CLI để kiểm thử webhook trong môi trường local:
   ```bash
   stripe listen --forward-to localhost:5000/api/v1/payments/webhook
   ```

2. Trong môi trường production, cấu hình webhook endpoint trong Dashboard Stripe trỏ đến URL triển khai của bạn.

### Bảo trì

- Thường xuyên backup cơ sở dữ liệu MongoDB
- Kiểm tra logs bằng PM2 hoặc công cụ giám sát
- Cập nhật định kỳ các dependencies để đảm bảo bảo mật
