const express = require('express');
const router = express.Router();
const restaurantController = require('../controllers/restaurant.controller');

router.get('/', restaurantController.getRestaurant);

router.post('/', restaurantController.createRestaurant);

router.get('/:id', restaurantController.getRestaurantById);

router.put('/:id', restaurantController.updateRestaurant);

router.patch('/:id/status', restaurantController.updateRestaurantStatus);

router.delete('/:id', restaurantController.deleteRestaurant);

module.exports = router;