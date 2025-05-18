const MenuItem = require('../models/menuItem.model');
const controllerHandler = require('../../../helpers/controllerHandler');
const logger = require('../../../helpers/logger');

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
        logger.error('Error fetching menu items:', error);
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
        
        // Validate required fields
        if (!title || !price || !categoryId) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: title, price, and categoryId are required'
            });
        }

        // Validate thumbnail
        if (!thumbnail) {
            return res.status(400).json({
                success: false,
                message: 'Thumbnail image is required'
            });
        }

        // Create menu item
        const menuItem = await MenuItem.create({
            title,
            description,
            price: Number(price),
            categoryId,
            thumbnail,
            images: images || [],
            status: status || 'active',
            tags: tags || [],
            discountPercentage: Number(discountPercentage) || 0
        });

        logger.info('Menu item created successfully:', { menuItemId: menuItem._id });

        res.status(201).json({
            success: true,
            message: 'Menu item created successfully',
            data: menuItem
        });
    } catch (error) {
        logger.error('Error creating menu item:', error);
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
        logger.error('Error fetching menu item:', error);
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
        const { title, description, price, categoryId, thumbnail, images, tags, discountPercentage, status } = req.body;

        // Build update object with only provided fields
        const updateData = {};
        if (title) updateData.title = title;
        if (description) updateData.description = description;
        if (price) updateData.price = Number(price);
        if (categoryId) updateData.categoryId = categoryId;
        if (thumbnail) updateData.thumbnail = thumbnail;
        if (images) updateData.images = images;
        if (tags) updateData.tags = tags;
        if (discountPercentage) updateData.discountPercentage = Number(discountPercentage);
        if (status) updateData.status = status;

        const menuItem = await MenuItem.findOneAndUpdate(
            { _id: id, deleted: false },
            updateData,
            { new: true }
        );

        if (!menuItem) {
            return res.status(404).json({
                success: false,
                message: 'Menu item not found'
            });
        }

        logger.info('Menu item updated successfully:', { menuItemId: id });

        res.status(200).json({
            success: true,
            message: 'Menu item updated successfully',
            data: menuItem
        });
    } catch (error) {
        logger.error('Error updating menu item:', error);
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

        if (!status || !['active', 'inactive', 'out_of_stock'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status. Status must be one of: active, inactive, out_of_stock'
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

        logger.info('Menu item status updated successfully:', { menuItemId: id, status });

        res.status(200).json({
            success: true,
            message: 'Menu item status updated successfully',
            data: menuItem
        });
    } catch (error) {
        logger.error('Error updating menu item status:', error);
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

        logger.info('Menu item deleted successfully:', { menuItemId: id });

        res.status(200).json({
            success: true,
            message: 'Menu item deleted successfully'
        });
    } catch (error) {
        logger.error('Error deleting menu item:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
});