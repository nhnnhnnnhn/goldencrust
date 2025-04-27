const MenuItem = require('../models/menuItem.model');
const controllerHandler = require('../../../helpers/controllerHandler');

// Get all menu items
module.exports.getMenuItems = controllerHandler(async (req, res) => {
    try {
        const menuItems = await MenuItem.find({ deleted: false });
        res.status(200).json({
            success: true,
            message: 'Menu items fetched successfully',
            data: menuItems
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
});

// Create menu item
module.exports.createMenuItem = controllerHandler(async (req, res) => {
    try {
        const { title, description, price, categoryId, thumbnail, images, status, tags, discountPercentage } = req.body;
        
        // Validate input
        if (!title || !price || !categoryId) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            });
        }

        const menuItem = await MenuItem.create({
            title,
            description,
            price,
            categoryId,
            thumbnail,
            images,
            status,
            tags,
            discountPercentage
        });

        res.status(201).json({
            success: true,
            message: 'Menu item created successfully',
            data: menuItem
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
});

// Get menu item by id
module.exports.getMenuItemById = controllerHandler(async (req, res) => {
    try {
        const { id } = req.params;
        const menuItem = await MenuItem.findOne({ _id: id, deleted: false });
        
        if (!menuItem) {
            return res.status(404).json({
                success: false,
                message: 'Menu item not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Menu item fetched successfully',
            data: menuItem
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
});

// Update menu item
module.exports.updateMenuItem = controllerHandler(async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, price, categoryId, thumbnail, images, tags, discountPercentage } = req.body;

        const menuItem = await MenuItem.findOneAndUpdate(
            { _id: id, deleted: false },
            { title, description, price, categoryId, thumbnail, images, tags, discountPercentage },
            { new: true }
        );

        if (!menuItem) {
            return res.status(404).json({
                success: false,
                message: 'Menu item not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Menu item updated successfully',
            data: menuItem
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
});

// Update menu item status
module.exports.updateMenuItemStatus = controllerHandler(async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!status) {
            return res.status(400).json({
                success: false,
                message: 'Status is required'
            });
        }

        const menuItem = await MenuItem.findOneAndUpdate(
            { _id: id, deleted: false },
            { status },
            { new: true }
        );

        if (!menuItem) {
            return res.status(404).json({
                success: false,
                message: 'Menu item not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Menu item status updated successfully',
            data: menuItem
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
});

// Delete menu item (soft delete)
module.exports.deleteMenuItem = controllerHandler(async (req, res) => {
    try {
        const { id } = req.params;
        
        const menuItem = await MenuItem.findOneAndUpdate(
            { _id: id, deleted: false },
            { deleted: true, deletedAt: new Date() },
            { new: true }
        );

        if (!menuItem) {
            return res.status(404).json({
                success: false,
                message: 'Menu item not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Menu item deleted successfully'
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
});