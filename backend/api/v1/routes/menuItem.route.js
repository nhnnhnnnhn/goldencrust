const express = require('express');
const router = express.Router();
const menuItemController = require('../controllers/menuItem.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// Get all menu items
router.get('/', menuItemController.getAllMenuItems);

// Search menu items
router.get('/search', menuItemController.searchMenuItems);

// Get menu item by id
router.get('/:id', menuItemController.getMenuItemById);

// Create new menu item (Admin only)
router.post('/', authMiddleware.checkAdmin, menuItemController.createMenuItem);

// Update menu item (Admin only)
router.put('/:id', authMiddleware.checkAdmin, menuItemController.updateMenuItem);

// Delete menu item (Admin only)
router.delete('/:id', authMiddleware.checkAdmin, menuItemController.deleteMenuItem);

module.exports = router;