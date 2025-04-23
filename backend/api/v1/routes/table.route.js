const express = require('express');
const router = express.Router();
const tableController = require('../controllers/table.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// Public routes
// Get all tables
router.get('/', tableController.getAllTables);

// Get available tables
router.get('/available', tableController.getAvailableTables);

// Admin routes
// Create new table (Admin only)
router.post('/', authMiddleware.checkAdmin, tableController.createTable);

// Get table by id (Admin only)
router.get('/:id', authMiddleware.checkAdmin, tableController.getTableById);

// Update table (Admin only)
router.put('/:id', authMiddleware.checkAdmin, tableController.updateTable);

// Update table status (Admin only)
router.patch('/:id/status', authMiddleware.checkAdmin, tableController.updateTableStatus);

// Delete table (Admin only)
router.delete('/:id', authMiddleware.checkAdmin, tableController.deleteTable);

module.exports = router;