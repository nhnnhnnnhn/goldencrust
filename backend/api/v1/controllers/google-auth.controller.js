const jwt = require('jsonwebtoken');
const Token = require('../models/token.model');
const User = require('../models/user.model');
const controllerHandler = require('../../../helpers/controllerHandler');
const logger = require('../../../helpers/logger');

// Xử lý callback từ Google OAuth
module.exports.googleCallback = controllerHandler(async (req, res) => {
    try {
        // req.user chứa thông tin người dùng từ Google được cung cấp bởi Passport
        if (!req.user) {
            return res.status(401).json({ message: 'Xác thực Google thất bại' });
        }

        const user = req.user;
        logger.info('Google authentication successful', { userId: user._id });

        // Tạo refresh token
        const refreshSecretKey = process.env.JWT_REFRESH_SECRET || 'golden-crust-refresh-default-secret-key';
        const refreshToken = jwt.sign({ id: user._id }, refreshSecretKey, {
            expiresIn: '7d',
        });

        // Lưu refresh token vào database
        await Token.create({
            userId: user._id,
            token: refreshToken,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 ngày
            createdAt: new Date(),
            createdByIp: req.ip,
        });

        // Tạo access token
        const secretKey = process.env.JWT_SECRET || 'golden-crust-default-secret-key';
        const token = jwt.sign({ id: user._id }, secretKey, {
            expiresIn: '1h',
        });

        // Lưu refresh token vào cookie
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày
        });

        // Cập nhật trạng thái user
        await User.updateOne({ _id: user._id }, {
            isActive: true,
            lastLogin: new Date()
        });

        // Chuyển hướng về frontend với token
        const frontendURL = process.env.FRONTEND_URL || 'http://localhost:3000';
        
        // Chuyển hướng đến API route của frontend để xử lý thông tin đăng nhập
        res.redirect(`${frontendURL}/api/auth/google/callback?token=${token}&email=${encodeURIComponent(user.email)}&fullName=${encodeURIComponent(user.fullName)}&role=${user.role}`);
    } catch (error) {
        logger.error('Error in Google OAuth callback', { error });
        const frontendURL = process.env.FRONTEND_URL || 'http://localhost:3000';
        res.redirect(`${frontendURL}/api/auth/google/callback?error=authentication_failed`);
    }
});
