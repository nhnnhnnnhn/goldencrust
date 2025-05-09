const OrderDetail = require('../models/orderDetail.model');
const controllerHandler = require('../../../helpers/controllerHandler');

// [POST] /api/v1/order-details
module.exports.createOrderDetail = controllerHandler(async (req, res) => {
    const { orderId, restaurantId, items, totalAmount, status, orderType } = req.body;
    
    if (!orderId || !items || !totalAmount) {
        return res.status(400).json({
            success: false,
            message: 'Missing required fields'
        });
    }
    
    const orderDetail = await OrderDetail.create({ 
        orderId, 
        restaurantId, 
        items, 
        totalAmount, 
        status, 
        orderType 
    });
    
    res.status(201).json({
        success: true,
        message: 'Order detail created successfully',
        data: orderDetail
    });
});

// [GET] /api/v1/order-details
module.exports.getOrderDetails = controllerHandler(async (req, res) => {
    const orderDetails = await OrderDetail.find({ deleted: false });
    
    res.status(200).json({
        success: true,
        message: 'Order details fetched successfully',
        data: orderDetails
    });
});

// [GET] /api/v1/order-details/:id
module.exports.getOrderDetailById = controllerHandler(async (req, res) => {
    const { id } = req.params;
    const orderDetail = await OrderDetail.findOne({ _id: id, deleted: false });
    
    if (!orderDetail) {
        return res.status(404).json({
            success: false,
            message: 'Order detail not found'
        });
    }
    
    res.status(200).json({
        success: true,
        message: 'Order detail fetched successfully',
        data: orderDetail
    });
});

// [PUT] /api/v1/order-details/:id
module.exports.updateOrderDetail = controllerHandler(async (req, res) => {
    const { id } = req.params;
    const { items, totalAmount, status, orderType } = req.body;
    
    const orderDetail = await OrderDetail.findOneAndUpdate(
        { _id: id, deleted: false },
        { items, totalAmount, status, orderType },
        { new: true }
    );
    
    if (!orderDetail) {
        return res.status(404).json({
            success: false,
            message: 'Order detail not found'
        });
    }
    
    res.status(200).json({
        success: true,
        message: 'Order detail updated successfully',
        data: orderDetail
    });
});

// [PATCH] /api/v1/order-details/:id/status
module.exports.updateOrderDetailStatus = controllerHandler(async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!status) {
        return res.status(400).json({
            success: false,
            message: 'Status is required'
        });
    }
    
    const orderDetail = await OrderDetail.findOneAndUpdate(
        { _id: id, deleted: false },
        { status },
        { new: true }
    );
    
    if (!orderDetail) {
        return res.status(404).json({
            success: false,
            message: 'Order detail not found'
        });
    }
    
    res.status(200).json({
        success: true,
        message: 'Order detail status updated successfully',
        data: orderDetail
    });
});

// [DELETE] /api/v1/order-details/:id
module.exports.deleteOrderDetail = controllerHandler(async (req, res) => {
    const { id } = req.params;
    
    const orderDetail = await OrderDetail.findOneAndUpdate(
        { _id: id, deleted: false },
        { deleted: true, deletedAt: new Date() },
        { new: true }
    );
    
    if (!orderDetail) {
        return res.status(404).json({
            success: false,
            message: 'Order detail not found'
        });
    }
    
    res.status(200).json({
        success: true,
        message: 'Order detail deleted successfully',
        data: orderDetail
    });
});

// [GET] /api/v1/order-details/order/:orderId
module.exports.getOrderDetailsByOrderId = controllerHandler(async (req, res) => {
    const { orderId } = req.params;
    
    const orderDetails = await OrderDetail.find({ orderId, deleted: false });
    
    res.status(200).json({
        success: true,
        message: 'Order details fetched successfully',
        data: orderDetails
    });
});

// [GET] /api/v1/order-details/restaurant/:restaurantId
module.exports.getOrderDetailsByRestaurantId = controllerHandler(async (req, res) => {
    const { restaurantId } = req.params;
    
    const orderDetails = await OrderDetail.find({ restaurantId, deleted: false });
    
    res.status(200).json({
        success: true,
        message: 'Order details fetched successfully',
        data: orderDetails
    });
});

// [GET] /api/v1/order-details/status/:status
module.exports.getOrderDetailsByStatus = controllerHandler(async (req, res) => {
    const { status } = req.params;
    
    const orderDetails = await OrderDetail.find({ status, deleted: false });
    
    res.status(200).json({
        success: true,
        message: 'Order details fetched successfully',
        data: orderDetails
    });
});

// [GET] /api/v1/order-details/type/:orderType
module.exports.getOrderDetailsByType = controllerHandler(async (req, res) => {
    const { orderType } = req.params;
    
    const orderDetails = await OrderDetail.find({ orderType, deleted: false });
    
    res.status(200).json({
        success: true,
        message: 'Order details fetched successfully',
        data: orderDetails
    });
});
