const Table = require('../models/table.model');
const ReservedTable = require('../models/reservedTable.model');
const Restaurant = require('../models/restaurant.model');
const controllerHandler = require('../../../helpers/controllerHandler');

// Get all tables
module.exports.getAllTables = controllerHandler(async (req, res) => {
    const { page = 1, limit = 10, restaurantId } = req.query;

    let query = { deleted: false };
    if (restaurantId) {
        query.restaurantId = restaurantId;
    }

    const tables = await Table.find(query)
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .sort({ tableNumber: 1 });

    const count = await Table.countDocuments(query);

    res.status(200).json({
        tables,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        totalItems: count
    });
});

// Get available tables
module.exports.getAvailableTables = controllerHandler(async (req, res) => {
    const { restaurantId, capacity, date, time } = req.query;

    let query = { 
        status: 'available',
        deleted: false
    };

    if (restaurantId) {
        query.restaurantId = restaurantId;
    }

    if (capacity) {
        query.capacity = { $gte: parseInt(capacity) };
    }

    let tables = await Table.find(query);

    // If date and time provided, check reservations
    if (date && time) {
        // Validate date and time format
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

        if (!dateRegex.test(date)) {
            return res.status(400).json({ message: 'Invalid date format. Use YYYY-MM-DD' });
        }

        if (!timeRegex.test(time)) {
            return res.status(400).json({ message: 'Invalid time format. Use HH:MM' });
        }

        // Check if date is not in the past
        const requestedDateTime = new Date(`${date}T${time}`);
        if (requestedDateTime < new Date()) {
            return res.status(400).json({ message: 'Cannot check availability for past date/time' });
        }

        const reservedTableIds = await ReservedTable.find({
            date: new Date(date),
            time,
            status: 'reserved'
        }).distinct('tableId');

        tables = tables.filter(table => !reservedTableIds.includes(table._id.toString()));
    }

    res.status(200).json(tables);
});

// Create new table
module.exports.createTable = controllerHandler(async (req, res) => {
    const { restaurantId, tableNumber, capacity, location } = req.body;

    // Check if user is admin
    if (req.user.role !== 'ADMIN') {
        return res.status(403).json({ message: 'Not authorized' });
    }

    // Validate required fields
    if (!restaurantId || !tableNumber || !capacity || !location) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    // Validate capacity
    if (capacity < 1 || capacity > 20) {
        return res.status(400).json({ message: 'Capacity must be between 1 and 20' });
    }

    // Validate location
    if (!['indoor', 'outdoor', 'bar', 'private'].includes(location)) {
        return res.status(400).json({ message: 'Invalid location' });
    }

    // Check if restaurant exists and is active
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
        return res.status(404).json({ message: 'Restaurant not found' });
    }

    if (restaurant.deleted) {
        return res.status(400).json({ message: 'Cannot add table to inactive restaurant' });
    }

    // Check if table number already exists in this restaurant
    const existingTable = await Table.findOne({
        restaurantId,
        tableNumber,
        deleted: false
    });
    
    if (existingTable) {
        return res.status(400).json({ message: 'Table number already exists in this restaurant' });
    }

    // Check if restaurant has reached maximum tables
    const currentTables = await Table.countDocuments({
        restaurantId,
        deleted: false
    });

    if (currentTables >= restaurant.tableNumber) {
        return res.status(400).json({
            message: `Restaurant cannot have more than ${restaurant.tableNumber} tables`
        });
    }

    const table = await Table.create({
        restaurantId,
        tableNumber,
        capacity,
        location,
        status: 'available',
        createdBy: req.user._id,
        updatedBy: req.user._id
    });

    res.status(201).json({
        message: 'Table created successfully',
        table
    });
});

// Get table by id
module.exports.getTableById = controllerHandler(async (req, res) => {
    const table = await Table.findOne({
        _id: req.params.id,
        deleted: false
    });

    if (!table) {
        return res.status(404).json({ message: 'Table not found' });
    }

    res.status(200).json(table);
});

// Update table
module.exports.updateTable = controllerHandler(async (req, res) => {
    const { tableNumber, capacity, location } = req.body;

    // Check if user is admin
    if (req.user.role !== 'ADMIN') {
        return res.status(403).json({ message: 'Not authorized' });
    }

    const table = await Table.findById(req.params.id);
    if (!table) {
        return res.status(404).json({ message: 'Table not found' });
    }

    // Check if table is currently reserved
    if (table.status === 'reserved') {
        return res.status(400).json({ message: 'Cannot update reserved table' });
    }

    // If changing table number, check for duplicates
    if (tableNumber && tableNumber !== table.tableNumber) {
        const existingTable = await Table.findOne({
            restaurantId: table.restaurantId,
            tableNumber,
            _id: { $ne: table._id }
        });
        if (existingTable) {
            return res.status(400).json({ message: 'Table number already exists in this restaurant' });
        }
    }

    const updatedTable = await Table.findByIdAndUpdate(
        req.params.id,
        {
            tableNumber: tableNumber || table.tableNumber,
            capacity: capacity || table.capacity,
            location: location || table.location
        },
        { new: true }
    );

    res.status(200).json({
        message: 'Table updated successfully',
        table: updatedTable
    });
});

// Update table status
module.exports.updateTableStatus = controllerHandler(async (req, res) => {
    const { status } = req.body;

    // Check if user is admin
    if (req.user.role !== 'ADMIN') {
        return res.status(403).json({ message: 'Not authorized' });
    }

    // Validate status
    if (!['available', 'reserved', 'occupied', 'maintenance'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status' });
    }

    const table = await Table.findById(req.params.id);
    if (!table) {
        return res.status(404).json({ message: 'Table not found' });
    }

    if (table.deleted) {
        return res.status(400).json({ message: 'Cannot update deleted table' });
    }

    // Validate status transition
    const validTransitions = {
        'available': ['reserved', 'maintenance'],
        'reserved': ['occupied', 'available'],
        'occupied': ['available'],
        'maintenance': ['available']
    };

    if (!validTransitions[table.status].includes(status)) {
        return res.status(400).json({
            message: `Cannot change status from ${table.status} to ${status}`
        });
    }

    try {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            // If marking as available, check for active reservations and orders
            if (status === 'available') {
                const activeReservation = await ReservedTable.findOne({
                    tableId: table._id,
                    status: 'reserved'
                }).session(session);

                if (activeReservation) {
                    throw new Error('Table has active reservations');
                }

                const activeOrder = await Order.findOne({
                    tableId: table._id,
                    status: { $in: ['pending', 'processing'] }
                }).session(session);

                if (activeOrder) {
                    throw new Error('Table has active orders');
                }
            }

            // If marking as maintenance, check future reservations
            if (status === 'maintenance') {
                const futureReservations = await ReservedTable.find({
                    tableId: table._id,
                    date: { $gte: new Date() },
                    status: 'reserved'
                }).session(session);

                if (futureReservations.length > 0) {
                    throw new Error('Table has future reservations');
                }
            }

            const updatedTable = await Table.findByIdAndUpdate(
                req.params.id,
                {
                    status,
                    updatedBy: req.user._id,
                    updatedAt: new Date()
                },
                { new: true, session }
            );

            // Update related records if needed
            if (status === 'available') {
                await ReservedTable.updateMany(
                    { tableId: table._id, status: 'reserved' },
                    { status: 'completed' },
                    { session }
                );
            }

            await session.commitTransaction();

            res.status(200).json({
                message: 'Table status updated successfully',
                table: updatedTable
            });

        } catch (error) {
            await session.abortTransaction();
            throw error;
        }

        session.endSession();

    } catch (error) {
        return res.status(400).json({
            message: error.message
        });
    }
});

// Delete table
module.exports.deleteTable = controllerHandler(async (req, res) => {
    // Check if user is admin
    if (req.user.role !== 'ADMIN') {
        return res.status(403).json({ message: 'Not authorized' });
    }

    const table = await Table.findById(req.params.id);
    if (!table) {
        return res.status(404).json({ message: 'Table not found' });
    }

    // Check if table has active reservations
    const activeReservation = await ReservedTable.findOne({
        tableId: table._id,
        status: 'reserved'
    });
    if (activeReservation) {
        return res.status(400).json({ message: 'Cannot delete table with active reservations' });
    }

    await Table.findByIdAndUpdate(req.params.id, {
        deleted: true,
        deletedAt: new Date()
    });

    res.status(200).json({ message: 'Table deleted successfully' });
});