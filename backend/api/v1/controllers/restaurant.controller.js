const Restaurant = require('../models/restaurant.model');
const controllerHandler = require('../../../helpers/controllerHandler');
const mongoose = require('mongoose');

// [GET] /api/v1/restaurants
module.exports.getRestaurant = controllerHandler(async (req, res) => {
    try {
        const restaurants = await Restaurant.find();
        res.status(200).json(
            {
                success: true,
                message: 'Restaurants fetched successfully',
                data: restaurants
            }
        );
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
});

// [POST] /api/v1/restaurants
module.exports.createRestaurant = controllerHandler(async (req, res) => {
    try {
        const { name, address, phone, email, tableNumber, image } = req.body;
        const restaurant = await Restaurant.create({ name, address, phone, email, tableNumber });
        res.status(201).json(
            {
                success: true,
                message: 'Restaurant created successfully',
                data: restaurant
            }
        );
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
});

// [GET] /api/v1/restaurants/:id
module.exports.getRestaurantById = controllerHandler(async (req, res) => {
    try {
        const { id } = req.params;
        console.log(`[getRestaurantById] Fetching restaurant with ID: ${id}`);
        
        // Validate MongoDB ID format
        if (!mongoose.Types.ObjectId.isValid(id)) {
            console.log(`[getRestaurantById] Invalid MongoDB ID format: ${id}`);
            return res.status(400).json({
                success: false,
                message: 'Invalid restaurant ID format'
            });
        }

        console.log(`[getRestaurantById] Looking for restaurant with query:`, { _id: id, deleted: false });
        const restaurant = await Restaurant.findOne({ 
            _id: id,
            deleted: false 
        });

        if (!restaurant) {
            console.log(`[getRestaurantById] Restaurant not found for ID: ${id}`);
            return res.status(404).json({
                success: false,
                message: 'Restaurant not found'
            });
        }

        console.log(`[getRestaurantById] Successfully found restaurant:`, restaurant);
        res.status(200).json({
            success: true,
            message: 'Restaurant fetched successfully',
            data: restaurant
        });
    } catch (error) {
        console.error('[getRestaurantById] Error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
});

// [PUT] /api/v1/restaurants/:id
module.exports.updateRestaurant = controllerHandler(async (req, res) => {
    try {
        const { id } = req.params;
        const { name, address, phone, email, status } = req.body;
        const restaurant = await Restaurant.findByIdAndUpdate(id, { name, address, phone, email, status }, { new: true });
        res.status(200).json(
            {
                success: true,
                message: 'Restaurant updated successfully',
                data: restaurant
            }   
        );
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
});

// [PATCH] /api/v1/restaurants/:id/status
module.exports.updateRestaurantStatus = controllerHandler(async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const restaurant = await Restaurant.findByIdAndUpdate(id, { status }, { new: true });
        res.status(200).json(
            {
                success: true,
                message: 'Restaurant updated successfully',
                data: restaurant
            }   
        );
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
});

// [DELETE] /api/v1/restaurants/:id
module.exports.deleteRestaurant = controllerHandler(async (req, res) => {
    try {
        const { id } = req.params;
        await Restaurant.findByIdAndDelete(id);
        res.status(204).json({
            success: true,
            message: 'Restaurant deleted successfully'
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
});