const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const Otp = require('../../../helpers/email');
const controllerHandler = require('../../../helpers/controllerHandler');
const Token = require('../models/token.model');
const logger = require('../../../helpers/logger');  // Import logger để thêm logging

// Login user
module.exports.loginUser = controllerHandler(async (req, res) => {
    let { email, password } = req.body;

    // Validate input
    if (!email || !password) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    email = email.toLowerCase();

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
        return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check if user is verified
    if (!user.isVerified) {
        return res.status(403).json({ message: 'Email not verified' });
    }

    // Check if user is deleted
    if (user.deleted) {
        return res.status(403).json({ message: 'User account is deleted' });
    }

    // Check if user is suspended
    if (user.status === 'suspended') {
        return res.status(403).json({ message: 'User account is suspended' });
    }

    // Log ra các biến môi trường liên quan đến JWT (không log giá trị thật, chỉ log trạng thái)
    logger.info('JWT Environment Variables Status', {
        JWT_SECRET_STATUS: process.env.JWT_SECRET ? 'Available' : 'Missing',
        JWT_REFRESH_SECRET_STATUS: process.env.JWT_REFRESH_SECRET ? 'Available' : 'Missing',
        JWT_RESET_SECRET_STATUS: process.env.JWT_RESET_SECRET ? 'Available' : 'Missing'
    });

    // Kiểm tra và sử dụng giá trị mặc định nếu không có biến môi trường
    const refreshSecretKey = process.env.JWT_REFRESH_SECRET || 'golden-crust-refresh-default-secret-key';

    // Create refresh token
    const refreshToken = jwt.sign({ id: user._id }, refreshSecretKey, {
        expiresIn: '7d',
    });
    await Token.create({
        userId: user._id,
        token: refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        createdAt: new Date(),
        createdByIp: req.ip,
    });

    // Kiểm tra và sử dụng giá trị mặc định nếu không có biến môi trường
    const secretKey = process.env.JWT_SECRET || 'golden-crust-default-secret-key';
    logger.info('Generating JWT token with user ID', { userId: user._id });

    // Generate JWT token
    const token = jwt.sign({ id: user._id }, secretKey, {
        expiresIn: '1h',
    });

    // Set refresh token in cookie
    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Update user status
    await User.updateOne({ _id: user._id }, {
        isActive: true,
        lastLogin: new Date()
    });


    // Send response
    res.status(200).json({
        message: 'Login successful',
        token,
        user: {
            id: user._id,
            email: user.email,
            fullName: user.fullName,
            role: user.role,
        },
    });
});

// Logout user
module.exports.logoutUser = controllerHandler(async (req, res) => {
    const { refreshToken } = req.cookies;

    // Validate input
    if (!refreshToken) {
        return res.status(400).json({ message: 'Missing refresh token' });
    }

    // Check if token exists
    const token = await Token.findOne({ token: refreshToken });
    if (!token) {
        return res.status(401).json({ message: 'Invalid refresh token' });
    }

    // Revoke token
    await Token.updateOne({ token: refreshToken }, {
        isRevoked: true,
        revokedAt: new Date(),
        revokedByIp: req.ip,
    });

    // Update user status
    await User.updateOne({ _id: token.userId }, {
        isActive: false,
        lastLogin: new Date(),
    });

    // Clear cookie
    res.clearCookie('refreshToken');

    res.status(200).json({ message: 'Logout successful' });
});

// Register user
module.exports.registerUser = controllerHandler(async (req, res) => {
    let { email, password, fullName, address, phone } = req.body;

    // Validate input
    if (!email || !password || !fullName || !address || !phone) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    email = email.toLowerCase();

    // Check if email is valid
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ message: 'Invalid email format' });
    }

    // Check if phone number is valid
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(phone)) {
        return res.status(400).json({ message: 'Invalid phone number format' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser && existingUser.isVerified) {
        return res.status(409).json({ message: 'Email already exists' });
    }
    else if (existingUser && !existingUser.isVerified) {
        // Check if phone number already exists
        const existingPhone = await User.findOne({ phone });
        if (existingPhone && existingPhone.isVerified) {
            return res.status(409).json({ message: 'Phone number already exists' });
        }
        else {
            await User.updateOne({ email }, { phone });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        await User.updateOne({email}, {
            fullName,
            address,
            hashedPassword
        });
        const otpResponse = await Otp.sendOtp(email, 'REGISTER');
        if (!otpResponse.status) {
            return res.status(500).json({ message: otpResponse.message });
        }
        return res.status(200).json({ message: 'OTP sent successfully. Please verify email!' });
    }
    else {
        // Check if phone number already exists
        const existingPhone = await User.findOne({ phone });
        if (existingPhone && existingPhone.isVerified) {
            return res.status(409).json({ message: 'Phone number already exists' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        await User.create({
            email,
            password: hashedPassword,
            fullName,
            address,
            phone,
            isVerified: false,
            avatar: null,
            lastLogin: null,
            role: 'user',
        });

        // Send OTP
        const otpResponse = await Otp.sendOtp(email, 'REGISTER');
        if (!otpResponse.status) {
            return res.status(500).json({ message: otpResponse.message });
        }
        res.status(201).json({ message: 'User registered successfully. Please verify email!' });
    }
});

// Verify OTP
module.exports.verifyOtpRegister = controllerHandler(async (req, res) => {
    let { email, code } = req.body;

    // Validate input
    if (!email || !code) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    email = email.toLowerCase();

    // Verify OTP
    const otpResponse = await Otp.verifyOtp(email, code, 'REGISTER');
    if (!otpResponse.status) {
        return res.status(400).json({ message: otpResponse.message });
    }

    // Update user to verified
    await User.updateOne({ email }, { isVerified: true });

    res.status(200).json({ message: 'Email verified successfully' });
});

// Change password
module.exports.changePassword = controllerHandler(async (req, res) => {
    let { email, oldPassword, newPassword } = req.body;

    // Validate input
    if (!email || !oldPassword || !newPassword) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    email = email.toLowerCase();

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
        return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check old password
    const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isOldPasswordValid) {
        return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check if new password is same as old password
    if (oldPassword === newPassword) {
        return res.status(400).json({ message: 'New password cannot be same as old password' });
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await User.updateOne({ email }, { password: hashedNewPassword });

    res.status(200).json({ message: 'Password changed successfully' });
});

// Forgot password
module.exports.forgotPassword = controllerHandler(async (req, res) => {
    const { email } = req.body;

    // Validate input
    if (!email) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user || !user.isVerified) {
        return res.status(404).json({ message: 'Email not found' });
    }

    // Send OTP
    const otpResponse = await Otp.sendOtp(email, 'FORGOT_PASSWORD');
    if (!otpResponse.status) {
        return res.status(500).json({ message: otpResponse.message });
    }
    res.status(200).json({ message: 'OTP sent successfully. Please verify email!' });
});

// Verify OTP for forgot password
module.exports.verifyOtpForgotPassword = controllerHandler(async (req, res) => {
    let { email, code } = req.body;

    email = email.toLowerCase();
    
    // Validate input
    if (!email || !code) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    // Verify OTP
    const otpResponse = await Otp.verifyOtp(email, code, 'FORGOT_PASSWORD');
    if (!otpResponse.status) {
        return res.status(400).json({ message: otpResponse.message });
    }

    // Kiểm tra và sử dụng giá trị mặc định nếu không có biến môi trường
    const resetSecretKey = process.env.JWT_RESET_SECRET || 'golden-crust-reset-default-secret-key';
    logger.info('Generating reset token for email', { email });

    // Generate reset token
    const resetToken = jwt.sign({ email }, resetSecretKey, {
        expiresIn: '15m',
    });

    // Không gửi email với link reset nữa mà chỉ trả về token cho frontend
    // để người dùng có thể reset mật khẩu ngay trong luồng OTP

    // Trả về token JWT để frontend sử dụng cho việc reset mật khẩu
    res.status(200).json({ message: 'Xác thực thành công', token: resetToken });
});

// Reset password
module.exports.resetPassword = controllerHandler(async (req, res) => {
    const { token, newPassword } = req.body;

    // Validate input
    if (!token || !newPassword) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    // Verify reset token
    let email;
    try {
        // Kiểm tra và sử dụng giá trị mặc định nếu không có biến môi trường
        const resetSecretKey = process.env.JWT_RESET_SECRET || 'golden-crust-reset-default-secret-key';
        logger.info('Verifying reset token');

        const decoded = jwt.verify(token, resetSecretKey);
        email = decoded.email;
    } catch (error) {
        logger.error('Token verification failed', { error });
        return res.status(401).json({ message: 'Invalid or expired token' });
    }

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
        return res.status(404).json({ message: 'Email not found' });
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await User.updateOne({ email }, { password: hashedNewPassword });

    res.status(200).json({ message: 'Password reset successfully' });
});

// Refresh token
module.exports.refreshToken = controllerHandler(async (req, res) => {
    const { refreshToken } = req.cookies;

    // Validate input
    if (!refreshToken) {
        return res.status(400).json({ message: 'Missing refresh token' });
    }

    // Check if token exists
    const token = await Token.findOne({ token: refreshToken });
    if (!token) {
        return res.status(401).json({ message: 'Invalid refresh token' });
    }

    // Verify refresh token
    let userId;
    try {
        // Kiểm tra và sử dụng giá trị mặc định nếu không có biến môi trường
        const refreshSecretKey = process.env.JWT_REFRESH_SECRET || 'golden-crust-refresh-default-secret-key';
        logger.info('Verifying refresh token');

        const decoded = jwt.verify(refreshToken, refreshSecretKey);
        userId = decoded.id;
    } catch (error) {
        logger.error('Token verification failed', { error });
        return res.status(401).json({ message: 'Invalid or expired refresh token' });
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }

    // Generate new tokens
    const newRefreshToken = jwt.sign({ id: user._id }, process.env.JWT_REFRESH_SECRET, {
        expiresIn: '7d',
    });

    // Revoke old refresh token
    await Token.updateOne({ token: refreshToken }, {
        isRevoked: true,
        revokedAt: new Date(),
        revokedByIp: req.ip,
    });

    // Create new refresh token record
    await Token.create({
        userId: user._id,
        token: newRefreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        createdAt: new Date(),
        createdByIp: req.ip,
    });

    // Set new refresh token in cookie
    res.cookie('refreshToken', newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Generate new JWT token
    const newToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: '1h',
    });
    logger.info('New tokens generated', { userId: user._id });
    // Send response
    res.status(200).json({
        message: 'Token refreshed successfully',
        token: newToken,
        user: {
            id: user._id,
            email: user.email,
            fullName: user.fullName,
            role: user.role,
        },
    });
});