const User = require('../models/user.model');
const controllerHandler = require('../../../helpers/controllerHandler');

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
    const { userId } = req;

    // Validate input
    if (!userId) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    // Get user profile
    const user = await User.findById({userId, deleted: false });
    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json(user);
});

// Update user profile
module.exports.updateUserProfile = controllerHandler(async (req, res) => {
    const { userId } = req;
    const {fullName, address, phone, avatar} = req.body;

    // Validate input
    if (!userId || !fullName || !address || !phone) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    // Check if user exists
    const existingUser = User.find({userId, deleted: false});
    if (!existingUser) {
        return res.status(404).json({ message: 'User not found' });
    }

    // Check if phone number is already in use
    const existingPhone = User.findOne({ phone });
    if(existingPhone && existingPhone._id.toString() !== userId) {
        return res.status(409).json({ message: 'Phone number already exists' });
    }

    // Update user profile
    try {
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { fullName, address, phone, avatar },
            { new: true }
        );
        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        return res.status(500).json({ message: 'Error updating user profile', error });
    }
    return res.status(200).json({ message: 'User profile updated successfully', user: updatedUser });
});

// Change user password
module.exports.changeUserPassword = controllerHandler(async (req, res) => {
    const { userId } = req;
    const { oldPassword, newPassword } = req.body;

    // Validate input
    if (!userId || !oldPassword || !newPassword) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }

    // Check if old password is correct
    const isMatch = await User.comparePassword(oldPassword, user.password);
    if (!isMatch) {
        return res.status(401).json({ message: 'Old password is incorrect' });
    }

    // Check if new password is the same as old password
    if (oldPassword === newPassword) {
        return res.status(400).json({ message: 'New password cannot be the same as old password' });
    }

    // Hash new password
    const hashedNewPassword = await User.hashPassword(newPassword);

    // Update password
    try {
        user.password = hashedNewPassword;
        await user.save();
    } catch (error) {
        return res.status(500).json({ message: 'Error changing password', error });
    }

    return res.status(200).json({ message: 'Password changed successfully' });
});