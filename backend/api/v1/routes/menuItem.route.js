const express = require('express');
const router = express.Router();
const menuItemController = require('../controllers/menuItem.controller');

// Get all menu items
router.get('/', menuItemController.getMenuItems);

// Create new menu item
router.post('/', menuItemController.createMenuItem);

// Get menu item by id
router.get('/:id', menuItemController.getMenuItemById);

// Update menu item
router.put('/:id', menuItemController.updateMenuItem);

// Update menu item status
router.patch('/:id/status', menuItemController.updateMenuItemStatus);

// Delete menu item
router.delete('/:id', menuItemController.deleteMenuItem);

module.exports = router;