require('dotenv').config();
const express = require('express');
const database = require('./config/database');
const routes = require('./api/v1/routes/index.route');
const logger = require('./helpers/logger');
const httpLogger = require('./middlewares/httpLogger.middleware');
const errorLogger = require('./middlewares/errorLogger.middleware');
const requestTime = require('./middlewares/requestTime.middleware');

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
app.use(requestTime); // Đo thời gian xử lý request
app.use(httpLogger); // Log tất cả HTTP requests
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});

// Routes
routes(app);

// Error handling middleware
app.use(errorLogger);

const server = app.listen(port, () => {
    logger.info(`Server is running on port ${port} in ${process.env.NODE_ENV || 'development'} mode`);
});

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