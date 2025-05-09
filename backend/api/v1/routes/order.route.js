const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
// [POST] /api/v1/orders
router.post('/', orderController.createOrder);

// [GET] /api/v1/orders
router.get('/', orderController.getOrders);

// [GET] /api/v1/orders/:id
router.get('/:id', orderController.getOrderById);

// [PUT] /api/v1/orders/:id
router.put('/:id', orderController.updateOrder);

// [PATCH] /api/v1/orders/:id/status
router.patch('/:id/status', orderController.updateOrderStatus);

// [DELETE] /api/v1/orders/:id
router.delete('/:id', orderController.deleteOrder);

// [GET] /api/v1/orders/table/:tableId
router.get('/table/:tableId', orderController.getOrdersByTableId);

// [GET] /api/v1/orders/customer/:customerId
router.get('/customer/:customerId', orderController.getOrdersByCustomerId);

// [GET] /api/v1/orders/restaurant/:restaurantId
router.get('/restaurant/:restaurantId', orderController.getOrdersByRestaurantId);

// [GET] /api/v1/orders/status/:status
router.get('/status/:status', orderController.getOrdersByStatus);

// [GET] /api/v1/orders/date/:date
router.get('/date/:date', orderController.getOrdersByDate);


module.exports = router;