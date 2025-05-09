const logger = require('../helpers/logger');

// Middleware xử lý và log lỗi
const errorLogger = (err, req, res, next) => {
    const { method, url, headers, body, params, query } = req;
    
    // Log chi tiết lỗi
    logger.error(`Error processing request: ${method} ${url}`, {
        error: {
            name: err.name,
            message: err.message,
            stack: err.stack
        },
        request: {
            headers: {
                'user-agent': headers['user-agent'],
                'content-type': headers['content-type'],
                host: headers.host,
                referer: headers.referer
            },
            body: process.env.NODE_ENV === 'development' ? body : '[hidden in production]',
            params,
            query
        },
        user: req.user ? { id: req.user._id, role: req.user.role } : 'unauthenticated'
    });

    // Gửi phản hồi lỗi phù hợp
    const statusCode = err.statusCode || 500;
    const errorMessage = process.env.NODE_ENV === 'production' && statusCode === 500
        ? 'Internal Server Error'
        : err.message || 'Something went wrong';

    res.status(statusCode).json({
        success: false,
        message: errorMessage,
        error: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
};

module.exports = errorLogger;
