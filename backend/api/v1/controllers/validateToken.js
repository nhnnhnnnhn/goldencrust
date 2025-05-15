const jwt = require('jsonwebtoken');
const controllerHandler = require('../../../helpers/controllerHandler');
const logger = require('../../../helpers/logger');

// Validate token endpoint - kiểm tra tính hiệu lực của token
module.exports.validateToken = controllerHandler(async (req, res) => {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        logger.warn('Token validation failed: No token provided');
        return res.status(401).json({ valid: false, message: 'No token provided' });
    }
    
    const token = authHeader.split(' ')[1];
    
    try {
        // Kiểm tra và sử dụng giá trị mặc định nếu không có biến môi trường
        const secretKey = process.env.JWT_SECRET || 'golden-crust-default-secret-key';
        logger.info('Validating token');
        
        jwt.verify(token, secretKey);
        logger.info('Token is valid');
        
        return res.status(200).json({ valid: true });
    } catch (error) {
        logger.warn('Token validation failed: Invalid token', { error: error.message });
        return res.status(401).json({ valid: false, message: 'Invalid or expired token' });
    }
});
