const express = require('express');
const router = express.Router();
const controller = require('../controllers/guest.controller');

// Route to get all guests
router.get('/', controller.getAllGuests);

// Route to get a guest by ID
router.get('/:id', controller.getGuestById);

// Route to create a new guest
router.post('/create', controller.createGuest);

// Route to update a guest by ID
router.patch('/:id', controller.updateGuest);

// Link guest to a user
router.patch('/:id/link', controller.linkGuest);

// Verify guest phone number
router.patch('/:id/verify', controller.verifyGuestPhone);

module.exports = router;