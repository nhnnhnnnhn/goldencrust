const express = require('express');
const router = express.Router();
const passport = require('passport');
const authController = require('../controllers/auth.controller');
const googleAuthController = require('../controllers/google-auth.controller');
const validateTokenController = require('../controllers/validateToken');

// Login route
router.post('/login', authController.loginUser);

// Register route
router.post('/register', authController.registerUser);

// Verify OTP route
router.post('/verify-otp', authController.verifyOtpRegister);

// Logout route
router.post('/logout', authController.logoutUser);

// Change password route
router.post('/change-password', authController.changePassword);

// Forgot password route
router.post('/forgot-password', authController.forgotPassword);

// Reset password route
router.post('/reset-password', authController.resetPassword);

// Verify OTP for forgot password route
router.post('/verify-otp-forgot-password', authController.verifyOtpForgotPassword);

// Validate token route
router.get('/validate-token', validateTokenController.validateToken);

// Google OAuth routes
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', passport.authenticate('google', { session: false, failureRedirect: '/login' }), googleAuthController.googleCallback);

module.exports = router;