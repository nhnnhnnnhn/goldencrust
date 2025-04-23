const express = require('express');
const router = express.Router();
const reservationController = require('../controllers/reservation.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// Create new reservation
router.post('/', authMiddleware, reservationController.createReservation);

// Get all reservations (admin)
router.get('/', authMiddleware, reservationController.getAllReservations);

// Get user's reservations
router.get('/my-reservations', authMiddleware, reservationController.getUserReservations);

// Check table availability
router.post('/check-availability', reservationController.checkAvailability);

// Get reservation by id
router.get('/:id', authMiddleware, reservationController.getReservationById);

// Update reservation status (Admin only)
router.patch('/:id/status', authMiddleware.checkAdmin, reservationController.updateReservationStatus);

// Cancel reservation
router.delete('/:id', authMiddleware, reservationController.cancelReservation);

module.exports = router;