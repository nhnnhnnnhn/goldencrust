const express = require('express');
const router = express.Router();
const tableController = require('../controllers/table.controller');

// Get all tables
router.get('/', tableController.getTables);

// Create new table
router.post('/', tableController.createTable);

// Get available tables
router.get('/available/:restaurantId', tableController.getAvailableTables);

// Get tables by restaurant id
router.get('/restaurant/:restaurantId', tableController.getTablesByRestaurant);

// Get tables by capacity
router.get('/capacity/:seats', tableController.getTablesByCapacity);

// Get table by id
router.get('/:id', tableController.getTableById);

// Update table
router.put('/:id', tableController.updateTable);

// Update table status
router.patch('/:id/status', tableController.updateTableStatus);

// Delete table
router.delete('/:id', tableController.deleteTable);

module.exports = router;