const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const authMiddleware = require('../middlewares/auth.middleware');

const multer = require('multer');
const upload = multer();
const uploadCloud = require('../middlewares/uploadCloud.middleware');


// Get all users
router.get('/get-user', authMiddleware, userController.getAllUsers);

// Get user by ID
router.get('/get-user/:id', authMiddleware, userController.getUserById);

// Create a new user
router.post('/create', authMiddleware, userController.createUser);

// Change user role
router.patch('/change-role/:id', authMiddleware, userController.changeUserRole);

// Update user
router.put('/update/:id',
    authMiddleware,
    upload.single('avatar'),
    uploadCloud.upload,
    userController.updateUser
);

// Delete user
router.patch('/delete/:id', authMiddleware, userController.deleteUser);

// Delete multiple users
router.patch('/delete-multiple', authMiddleware, userController.deleteMultipleUsers);

// Search users
router.get('/search', authMiddleware, userController.searchUsers);

// Toggle user suspension
router.patch('/suspend/:id', authMiddleware, userController.toggleUserSuspension);

// Toggle user activation
router.patch('/activate/:id', authMiddleware, userController.toggleUserActivation);

// User Stats
router.get('/stats', authMiddleware, userController.getUserStats);

// User Profile
router.get('/profile', authMiddleware, userController.getUserProfile);

// Update User Profile
router.patch('/profile/update',
    authMiddleware,
    upload.single('avatar'),
    uploadCloud.upload,
    userController.updateUserProfile
);

// Change User Password
router.patch('/change-password/:userId', authMiddleware, userController.changeUserPassword);

module.exports = router;