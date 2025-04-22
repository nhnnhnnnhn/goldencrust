const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const Otp = require('../../../helpers/email');
const controllerHandler = require('../../helpers/controllerHandler');

// Login user
module.exports.loginUser = controllerHandler(async (req, res) => {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

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

    // Generate JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: '1h',
    });

    res.status(200).json({ message: 'Login successful', token });
});

// Register user
module.exports.registerUser = controllerHandler(async (req, res) => {
    const { email, password, fullname } = req.body;

    // Validate input
    if (!email || !password || !fullname) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return res.status(409).json({ message: 'Email already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    await User.create({
        email,
        password: hashedPassword,
        fullName: fullname,
        role: 'USER',
    });

    // Send OTP
    const otpResponse = await Otp.sendOtp(email, 'REGISTER');
    if (!otpResponse.status) {
        return res.status(500).json({ message: otpResponse.message });
    }
    res.status(201).json({ message: 'User registered successfully. Please verify email!' });
});

// Verify OTP
module.exports.verifyOtp = controllerHandler(async (req, res) => {
    const { email, code } = req.body;

    // Validate input
    if (!email || !code) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

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
    const { email, oldPassword, newPassword } = req.body;

    // Validate input
    if (!email || !oldPassword || !newPassword) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

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