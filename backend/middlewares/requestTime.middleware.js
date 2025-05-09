/**
 * Middleware để theo dõi thời gian xử lý request
 */
const requestTimeMiddleware = (req, res, next) => {
    // Lưu thời điểm bắt đầu xử lý request
    req.startTime = Date.now();
    next();
};

module.exports = requestTimeMiddleware;
