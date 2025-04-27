const express = require('express');
const router = express.Router();
const reservedTableController = require('../controllers/reservedTable.controller');

// Get all reserved tables
router.get('/', reservedTableController.getReservedTables);

// Create new reserved table
router.post('/', reservedTableController.createReservedTable);

// Get reserved table by id
router.get('/:id', reservedTableController.getReservedTableById);

// Update reserved table
router.put('/:id', reservedTableController.updateReservedTable);

// Update reserved table status
router.patch('/:id/status', reservedTableController.updateReservedTableStatus);

// Delete reserved table
router.delete('/:id', reservedTableController.deleteReservedTable);

// Get reserved tables by table id
router.get('/table/:tableId', reservedTableController.getReservedTablesByTable);

// Check table availability
router.post('/check-availability', reservedTableController.checkTableAvailability);

module.exports = router;