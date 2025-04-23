const MenuItem = require('../models/menuItem.model');
const controllerHandler = require('../../../helpers/controllerHandler');

// Get all menu items
module.exports.getAllMenuItems = controllerHandler(async (req, res) => {
    const { page = 1, limit = 10 } = req.query;
    
    const menuItems = await MenuItem.find({ deleted: false })
        .limit(limit * 1)
        .skip((page - 1) * limit);
    
    const count = await MenuItem.countDocuments({ deleted: false });
    
    res.status(200).json({
        menuItems,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        totalItems: count
    });
});

// Get menu item by id
module.exports.getMenuItemById = controllerHandler(async (req, res) => {
    const menuItem = await MenuItem.findOne({ 
        _id: req.params.id,
        deleted: false 
    });
    
    if (!menuItem) {
        return res.status(404).json({ message: 'Menu item not found' });
    }
    
    res.status(200).json(menuItem);
});

// Create new menu item
module.exports.createMenuItem = controllerHandler(async (req, res) => {
    const { title, description, price, categoryId, thumbnail, images, tags } = req.body;

    // Validate required fields
    if (!title || !price || !categoryId) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    const menuItem = await MenuItem.create({
        title,
        description,
        price,
        categoryId,
        thumbnail,
        images: images || [],
        tags: tags || [],
        status: 'active'
    });

    res.status(201).json({
        message: 'Menu item created successfully',
        menuItem
    });
});

// Update menu item
module.exports.updateMenuItem = controllerHandler(async (req, res) => {
    const { title, description, price, categoryId, thumbnail, images, tags, status } = req.body;
    
    const menuItem = await MenuItem.findById(req.params.id);
    
    if (!menuItem) {
        return res.status(404).json({ message: 'Menu item not found' });
    }

    if (menuItem.deleted) {
        return res.status(400).json({ message: 'Cannot update deleted menu item' });
    }

    // Validate price if provided
    if (price && price < 0) {
        return res.status(400).json({ message: 'Price cannot be negative' });
    }

    // Validate status if provided
    if (status && !['active', 'inactive', 'out_of_stock'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status' });
    }

    // If changing to out_of_stock, check and update pending orders
    if (status === 'out_of_stock' && menuItem.status !== 'out_of_stock') {
        const pendingOrders = await OrderDetail.find({
            'items.menuItemId': req.params.id,
            status: 'pending'
        });

        if (pendingOrders.length > 0) {
            // Notify about pending orders that need attention
            return res.status(400).json({
                message: 'Cannot mark as out of stock - item has pending orders',
                affectedOrders: pendingOrders.length
            });
        }
    }

    const updatedMenuItem = await MenuItem.findByIdAndUpdate(
        req.params.id,
        {
            title: title || menuItem.title,
            description: description || menuItem.description,
            price: price || menuItem.price,
            categoryId: categoryId || menuItem.categoryId,
            thumbnail: thumbnail || menuItem.thumbnail,
            images: images || menuItem.images,
            tags: tags || menuItem.tags,
            status: status || menuItem.status,
            updatedAt: new Date()
        },
        { new: true }
    );

    res.status(200).json({
        message: 'Menu item updated successfully',
        menuItem: updatedMenuItem
    });
});

// Delete menu item (soft delete)
module.exports.deleteMenuItem = controllerHandler(async (req, res) => {
    const menuItem = await MenuItem.findById(req.params.id);
    
    if (!menuItem) {
        return res.status(404).json({ message: 'Menu item not found' });
    }

    // Check if menu item is being used in any active orders
    const activeOrderDetail = await OrderDetail.findOne({
        'items.menuItemId': req.params.id,
        status: { $in: ['pending', 'processing'] }
    });

    if (activeOrderDetail) {
        return res.status(400).json({
            message: 'Cannot delete menu item that is in active orders'
        });
    }

    await MenuItem.findByIdAndUpdate(req.params.id, {
        deleted: true,
        deletedAt: new Date()
    });

    res.status(200).json({ message: 'Menu item deleted successfully' });
});

// Search menu items
module.exports.searchMenuItems = controllerHandler(async (req, res) => {
    const { query, tags, category, minPrice, maxPrice, page = 1, limit = 10 } = req.query;

    let searchCriteria = { deleted: false };

    if (query) {
        searchCriteria.$or = [
            { title: { $regex: query, $options: 'i' } },
            { description: { $regex: query, $options: 'i' } }
        ];
    }

    if (tags) {
        searchCriteria.tags = { $in: tags.split(',') };
    }

    if (category) {
        searchCriteria.categoryId = category;
    }

    if (minPrice || maxPrice) {
        searchCriteria.price = {};
        if (minPrice) searchCriteria.price.$gte = parseFloat(minPrice);
        if (maxPrice) searchCriteria.price.$lte = parseFloat(maxPrice);
    }

    const menuItems = await MenuItem.find(searchCriteria)
        .limit(limit * 1)
        .skip((page - 1) * limit);

    const count = await MenuItem.countDocuments(searchCriteria);

    res.status(200).json({
        menuItems,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        totalItems: count
    });
});