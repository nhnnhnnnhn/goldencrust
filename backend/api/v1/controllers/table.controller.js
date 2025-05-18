const Table = require('../models/table.model');
const Reservation = require('../models/reservation.model');
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
        const { date, time } = req.query;

        console.log('[Backend] getAvailableTables called with:', {
            restaurantId,
            date,
            time,
            params: req.params,
            query: req.query,
            url: req.url
        });

        if (!date || !time) {
            return res.status(400).json({
                success: false,
                message: 'Date and time are required',
                error: {
                    type: 'ValidationError',
                    details: {
                        date: !date ? 'Date is required' : undefined,
                        time: !time ? 'Time is required' : undefined
                    }
                }
            });
        }

        // First get all tables for the restaurant
        const allTables = await Table.find({ 
            restaurantId,
            deleted: false 
        }).sort('tableNumber');

        if (!allTables || allTables.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No tables found for this restaurant',
                error: {
                    type: 'NotFoundError',
                    details: {
                        restaurantId,
                        tablesCount: 0
                    }
                }
            });
        }

        // Get all reservations for the date that are not cancelled
        const reservations = await Reservation.find({
            restaurantId,
            reservationDate: date,
            status: { $ne: 'cancelled' }
        });

        console.log('[Backend] Found reservations:', {
            count: reservations.length,
            reservations: reservations.map(r => ({
                id: r._id,
                date: r.reservationDate,
                time: r.reservationTime,
                tableIds: r.tableIds
            }))
        });

        // Parse the requested time
        const [hours, minutes] = time.split(':').map(Number);
        const requestedTimeInMinutes = hours * 60 + minutes;

        // Mark tables as reserved if they have a reservation within 2 hours before or after
        const availableTables = allTables.map(table => {
            // Safely check if the table is reserved
            const tableReservations = reservations.filter(res => {
                // Skip reservations without tableIds
                if (!res.tableIds || !Array.isArray(res.tableIds)) {
                    console.warn('[Backend] Reservation missing tableIds:', res._id);
                    return false;
                }
                return res.tableIds.some(id => id.toString() === table._id.toString());
            });

            const isReserved = tableReservations.some(res => {
                const [resHours, resMinutes] = res.reservationTime.split(':').map(Number);
                const resTimeInMinutes = resHours * 60 + resMinutes;
                const timeDiff = Math.abs(resTimeInMinutes - requestedTimeInMinutes);
                return timeDiff <= 120; // Within 2 hours
            });

            return {
                ...table.toObject(),
                status: isReserved ? 'reserved' : (table.status || 'available')
            };
        });

        console.log('[Backend] Available tables:', {
            total: allTables.length,
            available: availableTables.filter(t => t.status === 'available').length,
            reserved: availableTables.filter(t => t.status === 'reserved').length,
            time: time,
            tables: availableTables.map(t => ({
                id: t._id,
                number: t.tableNumber,
                status: t.status,
                capacity: t.capacity
            }))
        });

        return res.status(200).json({
            success: true,
            message: 'Available tables fetched successfully',
            data: availableTables
        });

    } catch (error) {
        console.error('[Backend] Error in getAvailableTables:', error);
        return res.status(500).json({
            success: false,
            message: 'Error checking table availability',
            error: {
                type: 'ServerError',
                message: error.message,
                stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
                details: {
                    restaurantId: req.params.restaurantId,
                    date: req.query.date,
                    time: req.query.time
                }
            }
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