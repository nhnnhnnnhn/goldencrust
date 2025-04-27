const Table = require('../models/table.model');
const controllerHandler = require('../../../helpers/controllerHandler');

// Get all tables
module.exports.getTables = controllerHandler(async (req, res) => {
    try {
        const tables = await Table.find({ deleted: false })
            .populate('restaurantId');
        
        res.status(200).json({
            success: true,
            message: 'Tables fetched successfully',
            data: tables
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
});

// Create table
module.exports.createTable = controllerHandler(async (req, res) => {
    try {
        const { restaurantId, tableNumber, capacity, location } = req.body;

        // Validate required fields
        if (!restaurantId || !tableNumber || !capacity || !location) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            });
        }

        // Check if table number already exists in restaurant
        const existingTable = await Table.findOne({
            restaurantId,
            tableNumber,
            deleted: false
        });

        if (existingTable) {
            return res.status(400).json({
                success: false,
                message: 'Table number already exists in this restaurant'
            });
        }

        const table = await Table.create({
            restaurantId,
            tableNumber,
            capacity,
            location,
            status: 'available'
        });

        res.status(201).json({
            success: true,
            message: 'Table created successfully',
            data: table
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
});

// Get table by id
module.exports.getTableById = controllerHandler(async (req, res) => {
    try {
        const { id } = req.params;
        const table = await Table.findOne({ _id: id, deleted: false })
            .populate('restaurantId');

        if (!table) {
            return res.status(404).json({
                success: false,
                message: 'Table not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Table fetched successfully',
            data: table
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
});

// Update table
module.exports.updateTable = controllerHandler(async (req, res) => {
    try {
        const { id } = req.params;
        const { capacity, location } = req.body;

        const table = await Table.findOneAndUpdate(
            { _id: id, deleted: false },
            { capacity, location },
            { new: true }
        ).populate('restaurantId');

        if (!table) {
            return res.status(404).json({
                success: false,
                message: 'Table not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Table updated successfully',
            data: table
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
});

// Update table status
module.exports.updateTableStatus = controllerHandler(async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!status || !['available', 'reserved', 'occupied'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status'
            });
        }

        const table = await Table.findOneAndUpdate(
            { _id: id, deleted: false },
            { status },
            { new: true }
        ).populate('restaurantId');

        if (!table) {
            return res.status(404).json({
                success: false,
                message: 'Table not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Table status updated successfully',
            data: table
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
});

// Delete table
module.exports.deleteTable = controllerHandler(async (req, res) => {
    try {
        const { id } = req.params;
        
        const table = await Table.findOneAndUpdate(
            { _id: id, deleted: false },
            { deleted: true, deletedAt: new Date() },
            { new: true }
        );

        if (!table) {
            return res.status(404).json({
                success: false,
                message: 'Table not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Table deleted successfully'
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
});

// Get tables by restaurant
module.exports.getTablesByRestaurant = controllerHandler(async (req, res) => {
    try {
        const { restaurantId } = req.params;
        const tables = await Table.find({ 
            restaurantId,
            deleted: false 
        }).sort('tableNumber');

        res.status(200).json({
            success: true,
            message: 'Tables fetched successfully',
            data: tables
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
});

// Get available tables
module.exports.getAvailableTables = controllerHandler(async (req, res) => {
    try {
        const { restaurantId } = req.params;
        const tables = await Table.find({ 
            restaurantId,
            status: 'available',
            deleted: false 
        }).sort('tableNumber');

        res.status(200).json({
            success: true,
            message: 'Available tables fetched successfully',
            data: tables
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
});

// Get tables by capacity
module.exports.getTablesByCapacity = controllerHandler(async (req, res) => {
    try {
        const { seats } = req.params;
        const tables = await Table.find({ 
            capacity: { $gte: parseInt(seats) },
            status: 'available',
            deleted: false 
        }).sort('capacity');

        res.status(200).json({
            success: true,
            message: 'Tables fetched successfully',
            data: tables
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
});