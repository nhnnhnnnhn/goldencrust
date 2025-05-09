const morgan = require('morgan');
const logger = require('../helpers/logger');

// Tạo format tùy chỉnh cho morgan
const morganFormat = process.env.NODE_ENV === 'production'
    ? 'combined'
    : 'dev';

// Tạo middleware HTTP logger với morgan
const httpLogger = morgan(morganFormat, {
    stream: logger.stream,
    // Bỏ qua các routes không cần log (như health check)
    skip: (req) => {
        return req.url === '/health' || req.url === '/favicon.ico';
    }
});

module.exports = httpLogger;
