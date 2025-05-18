const Order = require('../models/order.model');
const controllerHandler = require('../../../helpers/controllerHandler');


// [POST] /api/v1/orders
module.exports.createOrder = controllerHandler(async (req, res) => {
    const { tableId, customerId, restaurantId, status, totalAmount, paymentMethod, orderType } = req.body;
    const order = await Order.create({ tableId, customerId, restaurantId, status, totalAmount, paymentMethod,orderType });

    res.status(201).json({
        success: true,
        message: 'Order created successfully',
        data: order
    });
});

// [GET] /api/v1/orders
module.exports.getOrders = controllerHandler(async (req, res) => {
    const orders = await Order.find({ deleted: false });
    res.status(200).json({
        success: true,
        message: 'Orders fetched successfully',
        data: orders
    });
});

// [GET] /api/v1/orders/:id
module.exports.getOrderById = controllerHandler(async (req, res) => {
    const { id } = req.params;
    const order = await Order.findOne({ _id: id, deleted: false });
    
    if (!order) {
        return res.status(404).json({
            success: false,
            message: 'Order not found'
        });
    }

    res.status(200).json({
        success: true,
        message: 'Order fetched successfully',
        data: order
    });
});

// [PUT] /api/v1/orders/:id
module.exports.updateOrder = controllerHandler(async (req, res) => {
    const { id } = req.params;
    const { tableId, customerId, restaurantId, totalAmount, paymentMethod,orderType } = req.body;
    
    const order = await Order.findOneAndUpdate(
        { _id: id, deleted: false },
        { tableId, customerId, restaurantId, totalAmount, paymentMethod },
        { new: true }
    );
    
    if (!order) {
        return res.status(404).json({
            success: false,
            message: 'Order not found'
        });
    }

    res.status(200).json({
        success: true,
        message: 'Order updated successfully',
        data: order
    });
});

// [PATCH] /api/v1/orders/:id/status
module.exports.updateOrderStatus = controllerHandler(async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!status) {
        return res.status(400).json({
            success: false,
            message: 'Status is required'
        });
    }
    
    const order = await Order.findOneAndUpdate(
        { _id: id, deleted: false },
        { status },
        { new: true }
    );
    
    if (!order) {
        return res.status(404).json({
            success: false,
            message: 'Order not found'
        });
    }

    res.status(200).json({
        success: true,
        message: 'Order status updated successfully',
        data: order
    });
});

// [DELETE] /api/v1/orders/:id
module.exports.deleteOrder = controllerHandler(async (req, res) => {
    const { id } = req.params;
    
    const order = await Order.findOneAndUpdate(
        { _id: id, deleted: false },
        { deleted: true, deletedAt: new Date() },
        { new: true }
    );
    
    if (!order) {
        return res.status(404).json({
            success: false,
            message: 'Order not found'
        });
    }

    res.status(200).json({
        success: true,
        message: 'Order deleted successfully',
        data: order
    });
});

// [GET] /api/v1/orders/table/:tableId
module.exports.getOrdersByTableId = controllerHandler(async (req, res) => {
    const { tableId } = req.params;
    
    const orders = await Order.find({ tableId, deleted: false });
    
    res.status(200).json({
        success: true,
        message: 'Orders fetched successfully',
        data: orders
    });
});

// [GET] /api/v1/orders/customer/:customerId
module.exports.getOrdersByCustomerId = controllerHandler(async (req, res) => {
    const { customerId } = req.params;
    
    const orders = await Order.find({ customerId, deleted: false });
    
    res.status(200).json({
        success: true,
        message: 'Orders fetched successfully',
        data: orders
    });
});

// [GET] /api/v1/orders/restaurant/:restaurantId
module.exports.getOrdersByRestaurantId = controllerHandler(async (req, res) => {
    const { restaurantId } = req.params;
    
    const orders = await Order.find({ restaurantId, deleted: false });
    
    res.status(200).json({
        success: true,
        message: 'Orders fetched successfully',
        data: orders
    });
});

// [GET] /api/v1/orders/status/:status
module.exports.getOrdersByStatus = controllerHandler(async (req, res) => {
    const { status } = req.params;
    
    const orders = await Order.find({ status, deleted: false });
    
    res.status(200).json({
        success: true,
        message: 'Orders fetched successfully',
        data: orders
    });
});

// [GET] /api/v1/orders/date/:date
module.exports.getOrdersByDate = controllerHandler(async (req, res) => {
    const { date } = req.params;
    
    // Create date range for the given date (start of day to end of day)
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);
    
    const orders = await Order.find({
        createdAt: { $gte: startDate, $lte: endDate },
        deleted: false
    });
    
    res.status(200).json({
        success: true,
        message: 'Orders fetched successfully',
        data: orders
    });
});


