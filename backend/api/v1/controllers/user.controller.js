const User = require('../models/user.model');
const controllerHandler = require('../../../helpers/controllerHandler');
const bcrypt = require('bcrypt');

// Get all users
module.exports.getAllUsers = controllerHandler(async (req, res) => {
    const users = await User.find({ deleted: false });
    return res.status(200).json(users);
});

// Get user by ID
module.exports.getUserById = controllerHandler(async (req, res) => {
    const { id } = req.params;

    // Validate input
    if (!id) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    // Check if user exists
    const user = await User.findById(id);
    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json(user);
});

// Create a new user
module.exports.createUser = controllerHandler(async (req, res) => {
    const { email, password, role } = req.body;

    // Validate input
    if (!email || !password || !role) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return res.status(409).json({ message: 'User already exists' });
    }

    // Create new user
    try {
        const newUser = new User({ email, password, role });
        await newUser.save();
    } catch (error) {
        return res.status(500).json({ message: 'Error creating user', error });
    }

    return res.status(201).json(newUser);
});

// Change user role
module.exports.changeUserRole = controllerHandler(async (req, res) => {
    const { id } = req.params;
    const { role } = req.body;

    // Validate input
    if (!id || !role) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    // Validate role
    if (role !== 'admin' && role !== 'user') {
        return res.status(400).json({ message: 'Invalid role' });
    }   

    // Check if user exists
    const user = await User.findById(id);
    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }

    // Update user role
    try {
        user.role = role;
        await user.save();
    } catch (error) {
        return res.status(500).json({ message: 'Error updating user role', error });
    }

    return res.status(200).json(user);
});

// Update user
module.exports.updateUser = controllerHandler(async (req, res) => {
    const { id } = req.params;
    const { email, password, role, fullName, avatar, address, phone } = req.body;

    // Validate input
    if (!id || !email || !password || !role || !fullName || !avatar || !address || !phone) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    // Validate role
    if (role !== 'admin' && role !== 'user') {
        return res.status(400).json({ message: 'Invalid role' });
    }

    // Validate email
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({ message: 'Invalid email' });
    }

    // Validate fullName
    if (fullName.length < 3 || fullName.length > 50 || !/^[a-zA-Z\s]+$/.test(fullName)) {
        return res.status(400).json({ message: 'Full name must be at least 3 characters long' });
    }

    // Validate address
    if (address.length < 3 || address.length > 100 || !/^[a-zA-Z\s]+$/.test(address) ) {
        return res.status(400).json({ message: 'Address must be at least 3 characters long' });
    }

    // Validate phone
    if (!/^[0-9]+$/.test(phone) || phone.length !== 10) {
        return res.status(400).json({ message: 'Phone number must be 10 digits' });
    }

    // Check if email is already in use
    const existingUser = await User.findOne({ email });
    if (existingUser && existingUser._id.toString() !== id) {
        return res.status(409).json({ message: 'Email already exists' });
    }

    // Check if phone number is already in use
    const existingPhone = await User.findOne({ phone });
    if (existingPhone) {
        return res.status(409).json({ message: 'Phone number already exists' });
    }

    // Hash password
    const hashedPassword = await User.hashPassword(password);

    // Update user
    try {
        const updatedUser = await User.findByIdAndUpdate(
            id,
            { email, password: hashedPassword, role, fullName, avatar, address, phone },
            { new: true }
        );
        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        return res.status(500).json({ message: 'Error updating user', error });
    }

    return res.status(200).json({ message: 'User updated successfully', user: updatedUser });
});

// Delete user
module.exports.deleteUser = controllerHandler(async (req, res) => {
    const { id } = req.params;

    // Validate input
    if (!id) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    // Check if user exists
    const user = await User.findById(id);
    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }

    // Delete user
    try {
        await User.updateOne({ _id: id }, { deleted: true });
    } catch (error) {
        return res.status(500).json({ message: 'Error deleting user', error });
    }

    return res.status(200).json({ message: 'User deleted successfully' });
});

// Delete multiple users
module.exports.deleteMultipleUsers = controllerHandler(async (req, res) => {
    const { ids } = req.body;

    // Validate input
    if (!ids || !Array.isArray(ids)) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    // Delete users
    try {
        await User.updateMany({ _id: { $in: ids } }, { deleted: true });
    } catch (error) {
        return res.status(500).json({ message: 'Error deleting users', error });
    }

    return res.status(200).json({ message: 'Users deleted successfully' });
});

// Search users
module.exports.searchUsers = controllerHandler(async (req, res) => {
    const { query } = req.query;

    // Validate input
    if (!query) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    // Search users
    const users = await User.find({
        $or: [
            { email: { $regex: query, $options: 'i' } },
            { fullName: { $regex: query, $options: 'i' } },
            { phone: { $regex: query, $options: 'i' } }
        ],
        deleted: false
    });

    return res.status(200).json(users);
});

// Toggle user suspension
module.exports.toggleUserSuspension = controllerHandler(async (req, res) => {
    const { id } = req.params;

    // Validate input
    if (!id) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    // Check if user exists
    const user = await User.find({id, deleted: false});
    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }

    // Toggle suspension status
    try {
        user.isSuspended = !user.isSuspended;
        await user.save();
    } catch (error) {
        return res.status(500).json({ message: 'Error toggling user suspension', error });
    }

    return res.status(200).json({ message: 'User suspension status updated successfully', user });
});

// Toggle user activation
module.exports.toggleUserActivation = controllerHandler(async (req, res) => {
    const { id } = req.params;

    // Validate input
    if (!id) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    // Check if user exists
    const user = await User.find({id, deleted: false});
    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }

    // Toggle activation status
    try {
        user.isActive = !user.isActive;
        await user.save();
    } catch (error) {
        return res.status(500).json({ message: 'Error toggling user activation', error });
    }

    return res.status(200).json({ message: 'User activation status updated successfully', user });
});

// Get user stats
module.exports.getUserStats = controllerHandler(async (req, res) => {
    // Get user stats
    const totalUsers = await User.countDocuments({ deleted: false });
    const activeUsers = await User.countDocuments({ deleted: false, isActive: true });
    const suspendedUsers = await User.countDocuments({ deleted: false, isSuspended: true });

    return res.status(200).json({
        totalUsers,
        activeUsers,
        suspendedUsers
    });
});

// Get user profile
module.exports.getUserProfile = controllerHandler(async (req, res) => {
    const userId = req.user.id; // Get user ID from the token

    // Validate input
    if (!userId) {
        return res.status(400).json({ message: 'Missing user ID' });
    }

    // Get user profile
    const user = await User.findById(userId);
    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json(user);
});

// Update user profile
module.exports.updateUserProfile = controllerHandler(async (req, res) => {
    const userId = req.user.id; // Get user ID from the token
    const { fullName, address, phone, email } = req.body;

    // Validate input
    if (!userId || !fullName || !address || !phone || !email) {
        console.log('User not authenticated');
        return res.status(400).json({ message: 'User not authenticated' });
    }

    // Validate email
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        console.log('Invalid email');
        return res.status(400).json({ message: 'Invalid email' });
    }

    // Validate fullName
    if (fullName.length < 3 || fullName.length > 50 || !/^[a-zA-Z\s]+$/.test(fullName)) {
        console.log('Invalid full name');
        return res.status(400).json({ message: 'Full name must be 3-50 characters long and contain only letters' });
    }

    // Validate address
    if (address.length < 3 || address.length > 100) {
        console.log('Invalid address');
        return res.status(400).json({ message: 'Address must be 3-100 characters long' });
    }

    // Validate phone
    if (!/^[0-9]+$/.test(phone) || phone.length !== 10) {
        console.log('Invalid phone number');
        return res.status(400).json({ message: 'Phone number must be 10 digits' });
    }

    // Check if user exists
    const existingUser = await User.findById(userId);
    if (!existingUser) {
        console.log('User not found');
        return res.status(404).json({ message: 'User not found' });
    }

    // Check if email is already in use by another user
    if (email) {
        const existingEmail = await User.findOne({ email, _id: { $ne: userId } });
        if (existingEmail) {
            console.log('Email already exists');
            return res.status(409).json({ message: 'Email already exists' });
        }
    }

    // Check if phone number is already in use by another user
    if (phone) {
        const existingPhone = await User.findOne({ phone, _id: { $ne: userId } });
        if (existingPhone) {
            console.log('Phone number already exists');
            return res.status(409).json({ message: 'Phone number already exists' });
        }
    }

    // Update user profile
    try {
        const updateData = {};
        if (fullName) updateData.fullName = fullName;
        if (address) updateData.address = address;
        if (phone) updateData.phone = phone;
        if (email) updateData.email = email;

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            updateData,
            { new: true }
        );

        if (!updatedUser) {
            console.log('User not found');
            return res.status(404).json({ message: 'User not found' });
        }

        return res.status(200).json({ 
            message: 'User profile updated successfully', 
            user: updatedUser 
        });
    } catch (error) {
        console.error('Error updating user profile:', error);
        return res.status(500).json({ message: 'Error updating user profile', error });
    }
});

// Change user password
module.exports.changeUserPassword = controllerHandler(async (req, res) => {
    const userId = req.user.id; // Get user ID from the token
    const { oldPassword, newPassword } = req.body;

    // Validate input
    if (!userId) {
        return res.status(400).json({ message: 'User not authenticated' });
    }

    if (!oldPassword || !newPassword) {
        return res.status(400).json({ message: 'Both old and new passwords are required' });
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }

    // Check if old password is correct using bcrypt.compare
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
        return res.status(401).json({ message: 'Current password is incorrect' });
    }

    // Check if new password is the same as old password
    if (oldPassword === newPassword) {
        return res.status(400).json({ message: 'New password cannot be the same as current password' });
    }

    // Check password strength
    if (newPassword.length < 8 || !/[A-Z]/.test(newPassword) || !/[a-z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
        return res.status(400).json({ message: 'Password must be at least 8 characters long' });
    }

    // Hash new password before saving
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    try {
        user.password = hashedNewPassword;
        await user.save();
        return res.status(200).json({ message: 'Password changed successfully' });
    } catch (error) {
        console.error('Password change error:', error);
        return res.status(500).json({ message: 'Error changing password', error });
    }
});

// Delete user data
module.exports.deleteUserData = controllerHandler(async (req, res) => {
    const { email } = req.body; 

    // Validate input
    if (!email) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }

    // Delete user data 
    try {
        await User.deleteOne({ email });
    } catch (error) {
        return res.status(500).json({ message: 'Error deleting user data', error });
    }

    return res.status(200).json({ message: 'User data deleted successfully' });
});

// Admin Update User Profile
module.exports.adminUpdateUserProfile = controllerHandler(async (req, res) => {
    const { id } = req.params;
    const { fullName, address, phone, email } = req.body;

    // Validate input
    if (!id || !fullName || !address || !phone || !email) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    // Validate email
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({ message: 'Invalid email' });
    }

    // Validate fullName
    if (fullName.length < 3 || fullName.length > 50 || !/^[a-zA-Z\s]+$/.test(fullName)) {
        return res.status(400).json({ message: 'Full name must be 3-50 characters long and contain only letters' });
    }

    // Validate address
    if (address.length < 3 || address.length > 100) {
        return res.status(400).json({ message: 'Address must be 3-100 characters long' });
    }

    // Validate phone
    if (!/^[0-9]+$/.test(phone) || phone.length !== 10) {
        return res.status(400).json({ message: 'Phone number must be 10 digits' });
    }

    // Check if user exists
    const existingUser = await User.findById(id);
    if (!existingUser) {
        return res.status(404).json({ message: 'User not found' });
    }

    // Check if email is already in use by another user
    if (email) {
        const existingEmail = await User.findOne({ email, _id: { $ne: id } });
        if (existingEmail) {
            return res.status(409).json({ message: 'Email already exists' });
        }
    }

    // Check if phone is already in use by another user
    if (phone) {
        const existingPhone = await User.findOne({ phone, _id: { $ne: id } });
        if (existingPhone) {
            return res.status(409).json({ message: 'Phone number already exists' });
        }
    }

    // Update user
    try {
        const updatedUser = await User.findByIdAndUpdate(
            id,
            { fullName, address, phone, email },
            { new: true }
        );
        return res.status(200).json({ message: 'User updated successfully', user: updatedUser });
    } catch (error) {
        return res.status(500).json({ message: 'Error updating user', error });
    }
});
