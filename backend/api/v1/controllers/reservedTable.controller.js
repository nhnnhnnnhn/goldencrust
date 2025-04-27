const ReservedTable = require('../models/reservedTable.model');
const Table = require('../models/table.model');
const controllerHandler = require('../../../helpers/controllerHandler');

// Get all reserved tables
module.exports.getReservedTables = controllerHandler(async (req, res) => {
    try {
        const reservedTables = await ReservedTable.find({ deleted: false })
            .populate('tableId')
            .populate('userId');
        
        res.status(200).json({
            success: true,
            message: 'Reserved tables fetched successfully',
            data: reservedTables
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
});

// Create reserved table
module.exports.createReservedTable = controllerHandler(async (req, res) => {
    try {
        const { tableId, userId, date, time } = req.body;

        // Validate required fields
        if (!tableId || !userId || !date || !time) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            });
        }

        // Check if table exists and is available
        const table = await Table.findOne({ _id: tableId, status: 'available' });
        if (!table) {
            return res.status(400).json({
                success: false,
                message: 'Table not available'
            });
        }

        // Create reserved table
        const reservedTable = await ReservedTable.create({
            tableId,
            userId,
            date,
            time,
            status: 'reserved'
        });

        // Update table status
        await Table.findByIdAndUpdate(tableId, { status: 'reserved' });

        res.status(201).json({
            success: true,
            message: 'Table reserved successfully',
            data: reservedTable
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
});

// Get reserved table by id
module.exports.getReservedTableById = controllerHandler(async (req, res) => {
    try {
        const { id } = req.params;
        const reservedTable = await ReservedTable.findOne({ _id: id })
            .populate('tableId')
            .populate('userId');

        if (!reservedTable) {
            return res.status(404).json({
                success: false,
                message: 'Reserved table not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Reserved table fetched successfully',
            data: reservedTable
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
});

// Update reserved table
module.exports.updateReservedTable = controllerHandler(async (req, res) => {
    try {
        const { id } = req.params;
        const { date, time } = req.body;

        const reservedTable = await ReservedTable.findByIdAndUpdate(
            id,
            { date, time },
            { new: true }
        ).populate(['tableId', 'userId']);

        if (!reservedTable) {
            return res.status(404).json({
                success: false,
                message: 'Reserved table not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Reserved table updated successfully',
            data: reservedTable
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
});

// Update reserved table status
module.exports.updateReservedTableStatus = controllerHandler(async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!status || !['reserved', 'completed', 'cancelled'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status'
            });
        }

        const reservedTable = await ReservedTable.findByIdAndUpdate(
            id,
            { status },
            { new: true }
        ).populate(['tableId', 'userId']);

        if (!reservedTable) {
            return res.status(404).json({
                success: false,
                message: 'Reserved table not found'
            });
        }

        // Update table status
        if (status === 'cancelled') {
            await Table.findByIdAndUpdate(reservedTable.tableId, { status: 'available' });
        }

        res.status(200).json({
            success: true,
            message: 'Reserved table status updated successfully',
            data: reservedTable
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
});

// Delete reserved table
module.exports.deleteReservedTable = controllerHandler(async (req, res) => {
    try {
        const { id } = req.params;
        
        const reservedTable = await ReservedTable.findById(id);
        if (!reservedTable) {
            return res.status(404).json({
                success: false,
                message: 'Reserved table not found'
            });
        }

        await ReservedTable.findByIdAndDelete(id);
        
        // Update table status to available
        await Table.findByIdAndUpdate(reservedTable.tableId, { status: 'available' });

        res.status(200).json({
            success: true,
            message: 'Reserved table deleted successfully'
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
});

// Get reserved tables by table
module.exports.getReservedTablesByTable = controllerHandler(async (req, res) => {
    try {
        const { tableId } = req.params;
        const reservedTables = await ReservedTable.find({ tableId })
            .populate('userId');

        res.status(200).json({
            success: true,
            message: 'Reserved tables fetched successfully',
            data: reservedTables
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
});

// Check table availability
module.exports.checkTableAvailability = controllerHandler(async (req, res) => {
    try {
        const { tableId, date, time } = req.body;

        // Validate required fields
        if (!tableId || !date || !time) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            });
        }

        // Check if there are any existing reservations
        const existingReservation = await ReservedTable.findOne({
            tableId,
            date,
            time,
            status: 'reserved'
        });

        const isAvailable = !existingReservation;

        res.status(200).json({
            success: true,
            message: 'Availability checked successfully',
            data: {
                isAvailable,
                existingReservation
            }
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
});