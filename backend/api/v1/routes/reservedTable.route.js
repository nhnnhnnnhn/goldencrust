const express = require('express');
const router = express.Router();
const reservedTableController = require('../controllers/reservedTable.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// Get all reserved tables (admin only)
router.get('/', authMiddleware.checkAdmin, reservedTableController.getAllReservedTables);

// Get user's reserved tables
router.get('/my-reserved-tables', authMiddleware, reservedTableController.getUserReservedTables);

// Get reserved tables by date
router.get('/by-date', authMiddleware.checkAdmin, reservedTableController.getReservedTablesByDate);

// Get reserved tables by restaurant
router.get('/by-restaurant/:restaurantId', authMiddleware.checkAdmin, reservedTableController.getReservedTablesByRestaurant);

// Get reserved tables by table
router.get('/by-table/:tableId', authMiddleware.checkAdmin, reservedTableController.getReservedTablesByTable);

// Update reserved table status (admin only for non-user reservations)
router.patch('/:id/status', authMiddleware, reservedTableController.updateReservedTableStatus);

module.exports = router;