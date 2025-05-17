const express = require('express');
const router = express.Router();
const reservationController = require('../controllers/reservation.controller');

// Get all reservations
router.get('/', reservationController.getReservations);

// Get reservations by date range
router.get('/date-range', reservationController.getReservationsByDateRange);

// Create new reservation
router.post('/', reservationController.createReservation);

// Get reservation by id
router.get('/:id', reservationController.getReservationById);

// Update reservation
router.put('/:id', reservationController.updateReservation);

// Update reservation status
router.patch('/:id/status', reservationController.updateReservationStatus);

// Delete reservation
router.delete('/:id', reservationController.deleteReservation);

// Get reservations by restaurant id
router.get('/restaurant/:restaurantId', reservationController.getReservationsByRestaurant);

// Get reservations by user id
router.get('/user/:userId', reservationController.getReservationsByUser);

module.exports = router;