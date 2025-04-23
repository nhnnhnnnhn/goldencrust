const ReservedTable = require('../models/reservedTable.model');
const Table = require('../models/table.model');
const Restaurant = require('../models/restaurant.model');
const controllerHandler = require('../../../helpers/controllerHandler');

// Get all reserved tables (admin only)
module.exports.getAllReservedTables = controllerHandler(async (req, res) => {
    // Check if user is admin
    if (req.user.role !== 'ADMIN') {
        return res.status(403).json({ message: 'Not authorized' });
    }

    const { page = 1, limit = 10, status } = req.query;

    let query = {};
    if (status) {
        query.status = status;
    }

    const reservedTables = await ReservedTable.find(query)
        .populate('tableId')
        .populate('userId', 'fullName email phone')
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .sort({ date: 1, time: 1 });

    const count = await ReservedTable.countDocuments(query);

    res.status(200).json({
        reservedTables,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        totalItems: count
    });
});

// Get reserved tables by restaurant
module.exports.getReservedTablesByRestaurant = controllerHandler(async (req, res) => {
    const { restaurantId } = req.params;
    const { date, status, page = 1, limit = 10 } = req.query;

    // Check if restaurant exists
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
        return res.status(404).json({ message: 'Restaurant not found' });
    }

    // Get all tables of this restaurant
    const tables = await Table.find({ restaurantId }).distinct('_id');

    let query = {
        tableId: { $in: tables }
    };

    if (date) {
        query.date = new Date(date);
    }
    
    if (status) {
        query.status = status;
    }

    const reservedTables = await ReservedTable.find(query)
        .populate('tableId')
        .populate('userId', 'fullName email phone')
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .sort({ date: 1, time: 1 });

    const count = await ReservedTable.countDocuments(query);

    res.status(200).json({
        reservedTables,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        totalItems: count
    });
});

// Get reserved tables by date
module.exports.getReservedTablesByDate = controllerHandler(async (req, res) => {
    const { startDate, endDate, status, page = 1, limit = 10 } = req.query;

    let query = {};
    
    if (startDate && endDate) {
        query.date = {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
        };
    } else if (startDate) {
        query.date = { $gte: new Date(startDate) };
    } else if (endDate) {
        query.date = { $lte: new Date(endDate) };
    }

    if (status) {
        query.status = status;
    }

    const reservedTables = await ReservedTable.find(query)
        .populate('tableId')
        .populate('userId', 'fullName email phone')
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .sort({ date: 1, time: 1 });

    const count = await ReservedTable.countDocuments(query);

    res.status(200).json({
        reservedTables,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        totalItems: count
    });
});

// Get reserved tables by table
module.exports.getReservedTablesByTable = controllerHandler(async (req, res) => {
    const { tableId } = req.params;
    const { date, status, page = 1, limit = 10 } = req.query;

    // Check if table exists
    const table = await Table.findById(tableId);
    if (!table) {
        return res.status(404).json({ message: 'Table not found' });
    }

    let query = { tableId };

    if (date) {
        query.date = new Date(date);
    }
    
    if (status) {
        query.status = status;
    }

    const reservedTables = await ReservedTable.find(query)
        .populate('userId', 'fullName email phone')
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .sort({ date: 1, time: 1 });

    const count = await ReservedTable.countDocuments(query);

    res.status(200).json({
        reservedTables,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        totalItems: count
    });
});

// Get user's reserved tables
module.exports.getUserReservedTables = controllerHandler(async (req, res) => {
    const { status, page = 1, limit = 10 } = req.query;

    let query = { 
        userId: req.user._id
    };

    if (status) {
        query.status = status;
    }

    const reservedTables = await ReservedTable.find(query)
        .populate('tableId')
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .sort({ date: -1, time: -1 });

    const count = await ReservedTable.countDocuments(query);

    res.status(200).json({
        reservedTables,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        totalItems: count
    });
});

// Update reserved table status
module.exports.updateReservedTableStatus = controllerHandler(async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    // Validate status
    if (!['reserved', 'completed', 'cancelled'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status' });
    }

    // Check if reserved table exists
    const reservedTable = await ReservedTable.findById(id);
    if (!reservedTable) {
        return res.status(404).json({ message: 'Reserved table not found' });
    }

    // Check permissions
    if (req.user.role !== 'ADMIN' && reservedTable.userId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Not authorized' });
    }

    // Validate status transition
    if (reservedTable.status === 'completed' && status !== 'completed') {
        return res.status(400).json({ message: 'Cannot change status of completed reservation' });
    }

    if (reservedTable.status === 'cancelled' && status !== 'cancelled') {
        return res.status(400).json({ message: 'Cannot change status of cancelled reservation' });
    }

    // Check if the reservation time has passed for completion
    const reservationDateTime = new Date(`${reservedTable.date}T${reservedTable.time}`);
    if (status === 'completed' && reservationDateTime > new Date()) {
        return res.status(400).json({ message: 'Cannot complete future reservation' });
    }

    // If cancelling, check cancellation time limit (e.g., 1 hour before)
    if (status === 'cancelled') {
        const now = new Date();
        const hourBeforeReservation = new Date(reservationDateTime.getTime() - 60 * 60 * 1000);
        if (now > hourBeforeReservation) {
            return res.status(400).json({ message: 'Cannot cancel reservation less than 1 hour before' });
        }
    }

    // Update status
    const updatedReservedTable = await ReservedTable.findByIdAndUpdate(
        id,
        {
            status,
            deleted: status === 'cancelled' ? true : false,
            deletedAt: status === 'cancelled' ? new Date() : null
        },
        { new: true }
    ).populate('tableId');

    // Update table status accordingly
    if (status === 'cancelled' || status === 'completed') {
        await Table.findByIdAndUpdate(reservedTable.tableId, { status: 'available' });
    }

    res.status(200).json({
        message: 'Reserved table status updated successfully',
        reservedTable: updatedReservedTable
    });
});