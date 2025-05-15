const Restaurant = require('../models/restaurant.model');
const controllerHandler = require('../../../helpers/controllerHandler');

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
        const restaurant = await Restaurant.findById(id);
        if (!restaurant) {
            return res.status(404).json({
                success: false,
                message: 'Restaurant not found'
            });
        }
        res.status(200).json(
            {
                success: true,
                message: 'Restaurant fetched successfully',
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