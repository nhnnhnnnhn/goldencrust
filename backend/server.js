require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookie = require('cookie-parser');
const database = require('./config/database');
const passport = require('./config/passport');
const routes = require('./api/v1/routes/index.route');
const logger = require('./helpers/logger');
const httpLogger = require('./middlewares/httpLogger.middleware');
const errorLogger = require('./middlewares/errorLogger.middleware');
const requestTime = require('./middlewares/requestTime.middleware');
const socketIO = require('socket.io');

const app = express();
const port = process.env.PORT;

// Kết nối database
try {
    database.connect();
    logger.info('Connected to database successfully');
} catch (error) {
    logger.error('Failed to connect to database', { error });
    process.exit(1);
}

// Middleware
// Cấu hình CORS để cho phép frontend kết nối đến API
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    credentials: true,
    exposedHeaders: ['Set-Cookie']
}));

app.use(requestTime); // Đo thời gian xử lý request
app.use(httpLogger); // Log tất cả HTTP requests
app.use(express.json());
app.use(cookie()); // Parse cookies
app.use(passport.initialize()); // Khởi tạo Passport

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});

// Routes
routes(app);

// Error handling middleware
app.use((err, req, res, next) => {
    logger.error('Error:', { error: err.stack });
    res.status(err.status || 500).json({
        message: err.message || 'Internal Server Error',
        error: process.env.NODE_ENV === 'development' ? err : {}
    });
});

const server = app.listen(port, () => {
    logger.info(`Server is running on port ${port} in ${process.env.NODE_ENV || 'development'} mode`);
});

// Thiết lập Socket.IO
const io = socketIO(server, {
    cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:3000',
        methods: ['GET', 'POST'],
        credentials: true
    },
    path: '/socket.io',
    transports: ['websocket', 'polling'],
    allowEIO3: true
});

// Xử lý kết nối Socket.IO
io.on('connection', (socket) => {
    logger.info(`Client connected: ${socket.id}`);
    
    // Người dùng tham gia vào phòng chat cụ thể
    socket.on('join', (sessionId) => {
        socket.join(sessionId);
        logger.info(`Client ${socket.id} joined room: ${sessionId}`);
    });
    
    // Xử lý ngắt kết nối
    socket.on('disconnect', () => {
        logger.info(`Client disconnected: ${socket.id}`);
    });
});

// Xuất đối tượng io để sử dụng ở các module khác
global.io = io;

// Xử lý tắt server
process.on('SIGTERM', () => {
    logger.info('SIGTERM signal received: closing HTTP server');
    server.close(() => {
        logger.info('HTTP server closed');
        process.exit(0);
    });
});

// Xử lý lỗi không bắt được
process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception:', { error: error.stack });
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection at:', { promise, reason });
    process.exit(1);
});