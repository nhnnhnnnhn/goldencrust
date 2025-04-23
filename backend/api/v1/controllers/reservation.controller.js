const Reservation = require('../models/reservation.model');
const ReservedTable = require('../models/reservedTable.model');
const Table = require('../models/table.model');
const controllerHandler = require('../../../helpers/controllerHandler');

// Check table availability
module.exports.checkAvailability = controllerHandler(async (req, res) => {
    const { date, time, numberOfGuests } = req.body;

    if (!date || !time || !numberOfGuests) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    // Find tables that can accommodate the group
    const availableTables = await Table.find({
        capacity: { $gte: numberOfGuests },
        status: 'available'
    });

    // Check if these tables are not reserved for the requested time
    const reservedTableIds = await ReservedTable.find({
        date,
        time,
        status: 'reserved'
    }).distinct('tableId');

    const actuallyAvailableTables = availableTables.filter(
        table => !reservedTableIds.includes(table._id.toString())
    );

    res.status(200).json({
        available: actuallyAvailableTables.length > 0,
        availableTables: actuallyAvailableTables
    });
});

// Create new reservation
module.exports.createReservation = controllerHandler(async (req, res) => {
    const {
        customerName,
        customerPhone,
        reservationDate,
        reservationTime,
        numberOfGuests,
        specialRequests,
        restaurantId,
        tableId
    } = req.body;

    // Validate required fields
    if (!customerName || !customerPhone || !reservationDate || !reservationTime || !numberOfGuests || !restaurantId || !tableId) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    // Validate date and time format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

    if (!dateRegex.test(reservationDate)) {
        return res.status(400).json({ message: 'Invalid date format. Use YYYY-MM-DD' });
    }

    if (!timeRegex.test(reservationTime)) {
        return res.status(400).json({ message: 'Invalid time format. Use HH:MM' });
    }

    // Check if reservation time is in the future
    const reservationDateTime = new Date(`${reservationDate}T${reservationTime}`);
    if (reservationDateTime < new Date()) {
        return res.status(400).json({ message: 'Reservation time must be in the future' });
    }

    // Check if restaurant exists and is active
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant || restaurant.deleted) {
        return res.status(404).json({ message: 'Restaurant not found or inactive' });
    }

    // Check if table exists and belongs to the restaurant
    const table = await Table.findOne({ _id: tableId, restaurantId });
    if (!table || table.deleted) {
        return res.status(404).json({ message: 'Table not found' });
    }

    // Check if table capacity is sufficient
    if (table.capacity < numberOfGuests) {
        return res.status(400).json({ message: 'Table capacity is insufficient for the number of guests' });
    }

    // Check if table is available
    const existingReservation = await ReservedTable.findOne({
        tableId,
        date: reservationDate,
        time: reservationTime,
        status: 'reserved'
    });

    if (existingReservation) {
        return res.status(400).json({ message: 'Table is already reserved for this time' });
    }

    try {
        // Start transaction
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            // Create reservation
            const reservation = await Reservation.create([{
                customerName,
                customerPhone,
                reservationDate,
                reservationTime,
                numberOfGuests,
                specialRequests,
                restaurantId,
                status: 'pending',
                createdBy: req.user._id,
                updatedBy: req.user._id
            }], { session });

            // Create reserved table
            await ReservedTable.create([{
                tableId,
                userId: req.user._id,
                date: reservationDate,
                time: reservationTime,
                status: 'reserved'
            }], { session });

            // Update table status
            await Table.findByIdAndUpdate(
                tableId,
                { status: 'reserved' },
                { session }
            );

            // Commit transaction
            await session.commitTransaction();

            res.status(201).json({
                message: 'Reservation created successfully',
                reservation: reservation[0]
            });

        } catch (error) {
            // If error, abort transaction
            await session.abortTransaction();
            throw error;
        }

        // End session
        session.endSession();

    } catch (error) {
        return res.status(500).json({
            message: 'Failed to create reservation',
            error: error.message
        });
    }
});

// Get all reservations (admin)
module.exports.getAllReservations = controllerHandler(async (req, res) => {
    const { page = 1, limit = 10, status } = req.query;

    let query = { deleted: false };
    if (status) {
        query.status = status;
    }

    const reservations = await Reservation.find(query)
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .sort({ reservationDate: 1, reservationTime: 1 });

    const count = await Reservation.countDocuments(query);

    res.status(200).json({
        reservations,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        totalItems: count
    });
});

// Get user's reservations
module.exports.getUserReservations = controllerHandler(async (req, res) => {
    const { page = 1, limit = 10, status } = req.query;

    let query = { 
        createdBy: req.user._id,
        deleted: false
    };

    if (status) {
        query.status = status;
    }

    const reservations = await Reservation.find(query)
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .sort({ reservationDate: 1, reservationTime: 1 });

    const count = await Reservation.countDocuments(query);

    res.status(200).json({
        reservations,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        totalItems: count
    });
});

// Get reservation by id
module.exports.getReservationById = controllerHandler(async (req, res) => {
    const reservation = await Reservation.findOne({
        _id: req.params.id,
        deleted: false
    });

    if (!reservation) {
        return res.status(404).json({ message: 'Reservation not found' });
    }

    // Check if user has permission to view this reservation
    if (reservation.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'ADMIN') {
        return res.status(403).json({ message: 'Not authorized to view this reservation' });
    }

    res.status(200).json(reservation);
});

// Update reservation status
module.exports.updateReservationStatus = controllerHandler(async (req, res) => {
    const { status } = req.body;
    const { id } = req.params;

    if (!['pending', 'confirmed', 'cancelled', 'completed'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status' });
    }

    const reservation = await Reservation.findById(id);
    if (!reservation) {
        return res.status(404).json({ message: 'Reservation not found' });
    }

    if (reservation.deleted) {
        return res.status(400).json({ message: 'Cannot update deleted reservation' });
    }

    // Validate status transition
    if (reservation.status === 'cancelled') {
        return res.status(400).json({ message: 'Cannot update cancelled reservation' });
    }

    if (reservation.status === 'completed') {
        return res.status(400).json({ message: 'Cannot update completed reservation' });
    }

    // Only admin can change status of confirmed reservations
    if (reservation.status === 'confirmed' && req.user.role !== 'ADMIN') {
        return res.status(403).json({ message: 'Not authorized to update confirmed reservations' });
    }

    // Check time constraints
    const reservationDateTime = new Date(`${reservation.reservationDate}T${reservation.reservationTime}`);
    const now = new Date();

    if (status === 'cancelled' && (reservationDateTime - now) < 3600000) { // 1 hour
        return res.status(400).json({ message: 'Cannot cancel reservation less than 1 hour before' });
    }

    if (status === 'completed' && now < reservationDateTime) {
        return res.status(400).json({ message: 'Cannot complete future reservation' });
    }

    try {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const updatedReservation = await Reservation.findByIdAndUpdate(
                id,
                {
                    status,
                    updatedBy: req.user._id,
                    updatedAt: new Date()
                },
                { new: true, session }
            );

            // Update related records based on status
            const reservedTable = await ReservedTable.findOne({
                date: reservation.reservationDate,
                time: reservation.reservationTime
            }).session(session);

            if (reservedTable) {
                if (status === 'cancelled') {
                    await ReservedTable.findByIdAndUpdate(
                        reservedTable._id,
                        {
                            status: 'cancelled',
                            updatedAt: new Date()
                        },
                        { session }
                    );
                    await Table.findByIdAndUpdate(
                        reservedTable.tableId,
                        {
                            status: 'available',
                            updatedAt: new Date()
                        },
                        { session }
                    );
                } else if (status === 'confirmed') {
                    await ReservedTable.findByIdAndUpdate(
                        reservedTable._id,
                        {
                            status: 'reserved',
                            updatedAt: new Date()
                        },
                        { session }
                    );
                    await Table.findByIdAndUpdate(
                        reservedTable.tableId,
                        {
                            status: 'reserved',
                            updatedAt: new Date()
                        },
                        { session }
                    );
                } else if (status === 'completed') {
                    await ReservedTable.findByIdAndUpdate(
                        reservedTable._id,
                        {
                            status: 'completed',
                            updatedAt: new Date()
                        },
                        { session }
                    );
                    await Table.findByIdAndUpdate(
                        reservedTable.tableId,
                        {
                            status: 'available',
                            updatedAt: new Date()
                        },
                        { session }
                    );
                }
            }

            await session.commitTransaction();

            res.status(200).json({
                message: 'Reservation status updated successfully',
                reservation: updatedReservation
            });

        } catch (error) {
            await session.abortTransaction();
            throw error;
        }

        session.endSession();

    } catch (error) {
        return res.status(500).json({
            message: 'Failed to update reservation status',
            error: error.message
        });
    }
});

// Cancel reservation
module.exports.cancelReservation = controllerHandler(async (req, res) => {
    const reservation = await Reservation.findById(req.params.id);

    if (!reservation) {
        return res.status(404).json({ message: 'Reservation not found' });
    }

    // Check if user has permission to cancel
    if (reservation.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'ADMIN') {
        return res.status(403).json({ message: 'Not authorized to cancel this reservation' });
    }

    // Can't cancel if less than 1 hour before reservation
    const reservationTime = new Date(`${reservation.reservationDate}T${reservation.reservationTime}`);
    const now = new Date();
    if ((reservationTime - now) < 3600000) { // 1 hour in milliseconds
        return res.status(400).json({ message: 'Cannot cancel reservation less than 1 hour before' });
    }

    await Reservation.findByIdAndUpdate(req.params.id, {
        status: 'cancelled',
        deleted: true,
        deletedAt: new Date(),
        updatedBy: req.user._id
    });

    // Release the table
    const reservedTable = await ReservedTable.findOne({
        date: reservation.reservationDate,
        time: reservation.reservationTime
    });

    if (reservedTable) {
        await ReservedTable.findByIdAndUpdate(reservedTable._id, { status: 'cancelled' });
        await Table.findByIdAndUpdate(reservedTable.tableId, { status: 'available' });
    }

    res.status(200).json({ message: 'Reservation cancelled successfully' });
});