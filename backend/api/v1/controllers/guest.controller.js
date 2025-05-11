const Guest = require('../models/guest.model');
const User = require('../models/user.model');

// Get all guests
exports.getAllGuests = async (req, res) => {
    try {
        const guests = await Guest.find();
        return res.status(200).json({ guests });
    } catch (error) {
        return res.status(500).json({ message: 'Error fetching guests', error });
    }
};

// Get guest by ID
exports.getGuestById = async (req, res) => {
    try {
        const guest = await Guest.findById(req.params.id);
        if (!guest) {
            return res.status(404).json({ message: 'Guest not found' });
        }
        return res.status(200).json({ guest });
    } catch (error) {
        return res.status(500).json({ message: 'Error fetching guest', error });
    }
};

// Create a new guest
exports.createGuest = async (req, res) => {
    try {
        const newGuest = await Guest.create(req.body);
        return res.status(201).json({ guest: newGuest });
    } catch (error) {
        return res.status(500).json({ message: 'Error creating guest', error });
    }
};

// Update guest by ID
exports.updateGuest = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, phone, email } = req.body;
        if (!id) {
            return res.status(400).json({ message: 'Guest ID is required' });
        }
        if (!name && !phone && !email) {
            return res.status(400).json({ message: 'At least one field is required to update' });
        }
        const existingGuest = await Guest.findById(phone);
        if (existingGuest && existingGuest._id.toString() !== id) {
            return res.status(400).json({ message: 'Phone number already exists' });
        }
        const updatedGuest = await Guest.findByIdAndUpdate(
            id,
            { name, phone, email },
            { new: true }
        );
        if (!updatedGuest) {
            return res.status(404).json({ message: 'Guest not found' });
        }
        return res.status(200).json({ guest: updatedGuest });
    } catch (error) {
        return res.status(500).json({ message: 'Error updating guest', error });
    }
};

// Link guest to a user
exports.linkGuest = async (req, res) => {
    try {
        const { id } = req.params;
        const phone = req.body.phone;
        const email = req.body.email;
        if (!id) {
            return res.status(400).json({ message: 'Guest ID is required' });
        }
        const user = await User.find( { phone });
        const emailUser = await User.find( { email });
        if (!user && !emailUser) {
            return res.status(404).json({ message: 'User not found' });
        }
        const updatedGuest = await Guest.findByIdAndUpdate(
            id,
            { linkedUserId: user._id },
            { new: true }
        );
        if (!updatedGuest) {
            return res.status(404).json({ message: 'Guest not found' });
        }
        if (updatedGuest.linkedUserId) {
            return res.status(400).json({ message: 'Guest already linked to a user' });
        }
        res.status(200).json({ guest: updatedGuest });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        return res.status(200).json({ guest: updatedGuest });
    } catch (error) {
        return res.status(500).json({ message: 'Error linking guest', error });
    }
};

// Verify guest phone number
exports.verifyGuestPhone = async (req, res) => {
    try {
        const { id } = req.params;
        const { verifiedPhone } = req.body;
        if (!id) {
            return res.status(400).json({ message: 'Guest ID is required' });
        }
        if (!verifiedPhone) {
            return res.status(400).json({ message: 'Verified phone status is required' });
        }
        const guest = await Guest.findById(id);
        if (!guest) {
            return res.status(404).json({ message: 'Guest not found' });
        }
        if (guest.verifiedPhone === verifiedPhone) {
            return res.status(400).json({ message: 'Guest phone already verified' });
        }
        const updatedGuest = await Guest.findByIdAndUpdate(
            id,
            { verifiedPhone },
            { new: true }
        );
        if (!updatedGuest) {
            return res.status(404).json({ message: 'Guest not found' });
        }
        return res.status(200).json({ guest: updatedGuest });
    } catch (error) {
        return res.status(500).json({ message: 'Error verifying guest phone', error });
    }
};