const express = require('express');
const router = express.Router();
const menuItemController = require('../controllers/menuItem.controller');
const multer = require('multer');
const uploadCloud = require('../middlewares/uploadCloud.middleware');

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Get active menu items for customers
router.get('/active', menuItemController.getActiveMenuItems);

// Get all menu items
router.get('/', menuItemController.getMenuItems);

// Create new menu item
router.post('/', 
    upload.single('thumbnail'),
    uploadCloud.upload,
    menuItemController.createMenuItem
);

// Get menu item by id
router.get('/:id', menuItemController.getMenuItemById);

// Update menu item
router.put('/:id',
    upload.single('thumbnail'),
    uploadCloud.upload,
    menuItemController.updateMenuItem
);

// Update menu item status
router.patch('/:id/status', menuItemController.updateMenuItemStatus);

// Delete menu item
router.delete('/:id', menuItemController.deleteMenuItem);

module.exports = router;