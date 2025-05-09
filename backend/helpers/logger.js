const winston = require('winston');
require('winston-daily-rotate-file');
const path = require('path');
const fs = require('fs');

// Tạo thư mục logs nếu chưa tồn tại
const logDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir);
}

// Định dạng log
const { combine, timestamp, printf, colorize, align } = winston.format;

const logFormat = printf(({ level, message, timestamp, ...meta }) => {
    return `${timestamp} [${level}]: ${message} ${
        Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ''
    }`;
});

// Cấu hình transport cho log file với rotation
const fileRotateTransport = new winston.transports.DailyRotateFile({
    filename: path.join(logDir, 'application-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    maxFiles: '14d', // Giữ log trong 14 ngày
    maxSize: '20m', // Mỗi file tối đa 20MB
    zippedArchive: true,
    level: 'info'
});

// Transport cho error log
const errorFileRotateTransport = new winston.transports.DailyRotateFile({
    filename: path.join(logDir, 'error-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    maxFiles: '14d',
    maxSize: '20m',
    zippedArchive: true,
    level: 'error'
});

// Tạo logger instance
const logger = winston.createLogger({
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    format: combine(
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        align(),
        logFormat
    ),
    transports: [
        fileRotateTransport,
        errorFileRotateTransport
    ],
    exceptionHandlers: [
        new winston.transports.DailyRotateFile({
            filename: path.join(logDir, 'exceptions-%DATE%.log'),
            datePattern: 'YYYY-MM-DD',
            maxFiles: '14d',
            maxSize: '20m',
            zippedArchive: true
        })
    ],
    rejectionHandlers: [
        new winston.transports.DailyRotateFile({
            filename: path.join(logDir, 'rejections-%DATE%.log'),
            datePattern: 'YYYY-MM-DD',
            maxFiles: '14d',
            maxSize: '20m',
            zippedArchive: true
        })
    ]
});

// Thêm console transport trong môi trường development
if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: combine(
            colorize({ all: true }),
            timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
            align(),
            logFormat
        )
    }));
}

// Tạo stream để sử dụng với Morgan
logger.stream = {
    write: (message) => {
        logger.http(message.trim());
    }
};

module.exports = logger;
