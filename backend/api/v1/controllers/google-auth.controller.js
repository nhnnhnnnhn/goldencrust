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
        
        // Kiểm tra xem tài khoản này là mới tạo hay đã tồn tại
        // Một cách chính xác hơn, chúng ta cần biết liệu passport.js đã tìm thấy user đã tồn tại hay tạo mới
        
        // Giả sử một tài khoản là mới nếu:
        // - Source là 'google' và được tạo trong vòng 60 giây gần đây
        const createdRecently = req.user.source === 'google' && 
                            new Date().getTime() - new Date(req.user.createdAt).getTime() < 60000; // tạo trong vòng 1 phút
                            
        // Kiểm tra xem user có thông tin cần thiết để xác định đã hoàn tất đăng ký hay chưa
        const hasCompleteInfo = req.user.phone && req.user.address;
        
        // Chỉ coi là tài khoản mới nếu vừa tạo gần đây VÀ chưa có đầy đủ thông tin
        const isNewAccount = createdRecently && !hasCompleteInfo;

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

        // Chuyển hướng về frontend với token và thông tin về loại tài khoản
        const frontendURL = process.env.FRONTEND_URL || 'http://localhost:3000';
        
        // Thêm tham số isNewAccount để frontend biết đây là tài khoản mới hay không
        res.redirect(`${frontendURL}/api/auth/google/callback?token=${token}&email=${encodeURIComponent(user.email)}&fullName=${encodeURIComponent(user.fullName)}&role=${user.role}&isNewAccount=${isNewAccount}&googleId=${user.googleId || ''}`);
    } catch (error) {
        logger.error('Error in Google OAuth callback', { error });
        const frontendURL = process.env.FRONTEND_URL || 'http://localhost:3000';
        res.redirect(`${frontendURL}/api/auth/google/callback?error=authentication_failed`);
    }
});
