const logger = require('./logger');

/**
 * Utility để log các hành động trong controllers và services
 */
const loggerUtils = {
    /**
     * Log khi một api endpoint được gọi
     * @param {Object} req - Express request object
     * @param {String} controllerName - Tên của controller
     * @param {String} methodName - Tên của phương thức
     */
    logAPICall: (req, controllerName, methodName) => {
        const { method, originalUrl, params, query, body, user } = req;
        
        logger.info(`API Call: ${method} ${originalUrl}`, {
            controller: controllerName,
            method: methodName,
            params,
            query,
            body: process.env.NODE_ENV === 'development' ? body : '[hidden in production]',
            userId: user ? user._id : 'unauthenticated'
        });
    },

    /**
     * Log kết quả của một API call
     * @param {Object} req - Express request object
     * @param {String} controllerName - Tên của controller
     * @param {String} methodName - Tên của phương thức
     * @param {Number} statusCode - HTTP status code
     * @param {Object} [data] - Dữ liệu phản hồi (optional)
     */
    logAPIResponse: (req, controllerName, methodName, statusCode, data = null) => {
        logger.info(`API Response: ${req.method} ${req.originalUrl}`, {
            controller: controllerName,
            method: methodName,
            statusCode,
            responseTime: Date.now() - req.startTime,
            userId: req.user ? req.user._id : 'unauthenticated',
            dataSnapshot: data ? JSON.stringify(data).substring(0, 200) : null
        });
    },

    /**
     * Log lỗi xảy ra trong controller
     * @param {Object} req - Express request object
     * @param {String} controllerName - Tên của controller
     * @param {String} methodName - Tên của phương thức
     * @param {Error} error - Đối tượng lỗi
     */
    logControllerError: (req, controllerName, methodName, error) => {
        logger.error(`Error in controller: ${controllerName}.${methodName}`, {
            method: req.method,
            url: req.originalUrl,
            params: req.params,
            query: req.query,
            body: process.env.NODE_ENV === 'development' ? req.body : '[hidden in production]',
            userId: req.user ? req.user._id : 'unauthenticated',
            error: {
                name: error.name,
                message: error.message,
                stack: error.stack
            }
        });
    },

    /**
     * Log lỗi trong database operations
     * @param {String} operation - Loại operation (create, find, update, delete)
     * @param {String} model - Tên model
     * @param {Error} error - Đối tượng lỗi
     * @param {Object} [data] - Dữ liệu liên quan đến operation
     */
    logDBError: (operation, model, error, data = null) => {
        logger.error(`Database error: ${operation} on ${model}`, {
            operation,
            model,
            data: process.env.NODE_ENV === 'development' ? data : '[hidden in production]',
            error: {
                name: error.name,
                message: error.message,
                stack: error.stack
            }
        });
    },

    /**
     * Log thông tin chung
     * @param {String} message - Thông điệp log
     * @param {Object} [meta] - Metadata bổ sung
     */
    info: (message, meta = {}) => {
        logger.info(message, meta);
    },

    /**
     * Log cảnh báo
     * @param {String} message - Thông điệp warning
     * @param {Object} [meta] - Metadata bổ sung
     */
    warn: (message, meta = {}) => {
        logger.warn(message, meta);
    },

    /**
     * Log lỗi
     * @param {String} message - Thông điệp lỗi
     * @param {Object} [meta] - Metadata bổ sung
     */
    error: (message, meta = {}) => {
        logger.error(message, meta);
    },

    /**
     * Log thông tin debug
     * @param {String} message - Thông điệp debug
     * @param {Object} [meta] - Metadata bổ sung
     */
    debug: (message, meta = {}) => {
        logger.debug(message, meta);
    }
};

module.exports = loggerUtils;
