const express = require('express');
const router = express.Router();
const orderDetailController = require('../controllers/orderDetail.controller');

// [POST] /api/v1/order-details
router.post('/', orderDetailController.createOrderDetail);

// [GET] /api/v1/order-details
router.get('/', orderDetailController.getOrderDetails);

// [GET] /api/v1/order-details/:id
router.get('/:id', orderDetailController.getOrderDetailById);

// [PUT] /api/v1/order-details/:id
router.put('/:id', orderDetailController.updateOrderDetail);

// [PATCH] /api/v1/order-details/:id/status
router.patch('/:id/status', orderDetailController.updateOrderDetailStatus);

// [DELETE] /api/v1/order-details/:id
router.delete('/:id', orderDetailController.deleteOrderDetail);

// [GET] /api/v1/order-details/order/:orderId
router.get('/order/:orderId', orderDetailController.getOrderDetailsByOrderId);

// [GET] /api/v1/order-details/restaurant/:restaurantId
router.get('/restaurant/:restaurantId', orderDetailController.getOrderDetailsByRestaurantId);

// [GET] /api/v1/order-details/status/:status
router.get('/status/:status', orderDetailController.getOrderDetailsByStatus);

// [GET] /api/v1/order-details/type/:orderType
router.get('/type/:orderType', orderDetailController.getOrderDetailsByType);

module.exports = router;
