const Reservation = require('../models/reservation.model');
const Table = require('../models/table.model');
const controllerHandler = require('../../../helpers/controllerHandler');

// Get all reservations
module.exports.getReservations = controllerHandler(async (req, res) => {
    try {
        const reservations = await Reservation.find({ deleted: false })
            .populate('restaurantId')
            .populate('createdBy', 'fullName email')
            .populate('reservedTables');
        
        res.status(200).json({
            success: true,
            message: 'Reservations fetched successfully',
            data: reservations
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
});

// Create reservation
module.exports.createReservation = controllerHandler(async (req, res) => {
    try {
        const {
            customerName,
            customerPhone,
            reservationDate,
            reservationTime,
            numberOfGuests,
            specialRequests,
            restaurantId,
            reservedTables
        } = req.body;

        // Validate required fields
        if (!customerName || !customerPhone || !reservationDate || !reservationTime || !numberOfGuests || !restaurantId || !reservedTables || !reservedTables.length) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            });
        }

        // Check if all tables exist and are available
        const tables = await Table.find({ 
            _id: { $in: reservedTables },
            status: 'available'
        });

        if (tables.length !== reservedTables.length) {
            return res.status(400).json({
                success: false,
                message: 'One or more tables are not available'
            });
        }

        // Create reservation
        const reservation = await Reservation.create({
            customerName,
            customerPhone,
            reservationDate,
            reservationTime,
            numberOfGuests,
            specialRequests,
            restaurantId,
            reservedTables,
            createdBy: req.user.id,
            updatedBy: req.user.id
        });

        // Update tables status to reserved
        await Table.updateMany(
            { _id: { $in: reservedTables } },
            { status: 'reserved' }
        );

        // Populate the reservation with table details
        const populatedReservation = await Reservation.findById(reservation._id)
            .populate('restaurantId')
            .populate('reservedTables')
            .populate('createdBy', 'fullName email');

        res.status(201).json({
            success: true,
            message: 'Reservation created successfully',
            data: populatedReservation
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
});

// Get reservation by id
module.exports.getReservationById = controllerHandler(async (req, res) => {
    try {
        const { id } = req.params;
        const reservation = await Reservation.findOne({ _id: id, deleted: false })
            .populate('restaurantId')
            .populate('createdBy', 'fullName email')
            .populate('reservedTables');

        if (!reservation) {
            return res.status(404).json({
                success: false,
                message: 'Reservation not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Reservation fetched successfully',
            data: reservation
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
});

// Update reservation
module.exports.updateReservation = controllerHandler(async (req, res) => {
    try {
        const { id } = req.params;
        const {
            customerName,
            customerPhone,
            reservationDate,
            reservationTime,
            numberOfGuests,
            specialRequests
        } = req.body;

        const reservation = await Reservation.findOneAndUpdate(
            { _id: id, deleted: false },
            {
                customerName,
                customerPhone,
                reservationDate,
                reservationTime,
                numberOfGuests,
                specialRequests,
                updatedBy: req.user.id
            },
            { new: true }
        ).populate('restaurantId');

        if (!reservation) {
            return res.status(404).json({
                success: false,
                message: 'Reservation not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Reservation updated successfully',
            data: reservation
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
});

// Update reservation status
module.exports.updateReservationStatus = controllerHandler(async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!status) {
            return res.status(400).json({
                success: false,
                message: 'Status is required'
            });
        }

        const reservation = await Reservation.findOneAndUpdate(
            { _id: id, deleted: false },
            { 
                status,
                updatedBy: req.user.id
            },
            { new: true }
        ).populate('restaurantId');

        if (!reservation) {
            return res.status(404).json({
                success: false,
                message: 'Reservation not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Reservation status updated successfully',
            data: reservation
        });
    } catch (error) {
        console.log('Full error:', {
            message: error.message,
            status: error.response?.status,
            data: error.response?.data,
            stack: error.stack
        });
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
});

// Delete reservation (soft delete)
module.exports.deleteReservation = controllerHandler(async (req, res) => {
    try {
        const { id } = req.params;
        
        const reservation = await Reservation.findOneAndUpdate(
            { _id: id, deleted: false },
            { 
                deleted: true,
                deletedAt: new Date(),
                updatedBy: req.user.id
            },
            { new: true }
        );

        if (!reservation) {
            return res.status(404).json({
                success: false,
                message: 'Reservation not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Reservation deleted successfully'
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
});

// Get reservations by restaurant
module.exports.getReservationsByRestaurant = controllerHandler(async (req, res) => {
    try {
        const { restaurantId } = req.params;
        const reservations = await Reservation.find({ 
            restaurantId,
            deleted: false 
        }).populate('createdBy', 'fullName email');

        res.status(200).json({
            success: true,
            message: 'Reservations fetched successfully',
            data: reservations
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
});

// Get reservations by user
module.exports.getReservationsByUser = controllerHandler(async (req, res) => {
    try {
        const { userId } = req.params;
        const reservations = await Reservation.find({ 
            createdBy: userId,
            deleted: false 
        }).populate('restaurantId');

        res.status(200).json({
            success: true,
            message: 'Reservations fetched successfully',
            data: reservations
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
});

// Get reservations by date range
module.exports.getReservationsByDateRange = controllerHandler(async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        
        console.log('Date range query:', { startDate, endDate });
        
        // Create date range (start of day to end of day)
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        
        console.log('Converted date range:', { start, end });
        
        const reservations = await Reservation.find({
            reservationDate: { $gte: start, $lte: end },
            deleted: false
        })
        .populate('restaurantId')
        .populate('reservedTables')
        .populate('createdBy', 'fullName email');
        
        console.log('Found reservations:', reservations);
        
        res.status(200).json({
            success: true,
            message: 'Reservations fetched successfully',
            data: reservations
        });
    } catch (error) {
        console.error('Error in getReservationsByDateRange:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
});