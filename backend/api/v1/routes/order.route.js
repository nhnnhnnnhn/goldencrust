const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');

// Create new order
router.post('/', orderController.createOrder);

// Get today's orders
router.get('/today', orderController.getTodayOrders);

// Get specific order by ID
router.get('/:id', orderController.getOrderById);

// Update order status
router.patch('/:id/status', orderController.updateOrderStatus);

// Get restaurant's today orders
router.get('/restaurant/:restaurantId/today', orderController.getRestaurantTodayOrders);

// Get today's orders by type (dine-in/takeaway)
router.get('/type/:orderType/today', orderController.getTodayOrdersByType);

module.exports = router;