const Order = require('../models/order.model');
const controllerHandler = require('../../../helpers/controllerHandler');

// [POST] /api/v1/orders
module.exports.createOrder = controllerHandler(async (req, res) => {
    const { userId, restaurantId, items, orderType, totalAmount } = req.body;

    if (!userId || !restaurantId || !items || !orderType || !totalAmount) {
        return res.status(400).json({
            success: false,
            message: 'Missing required fields'
        });
    }

    // Set order date to today
    const orderDate = new Date();
    orderDate.setHours(0, 0, 0, 0);

    const order = await Order.create({
        userId,
        restaurantId,
        orderDate,
        items,
        orderType,
        totalAmount
    });

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

// [GET] /api/v1/orders/today
module.exports.getTodayOrders = controllerHandler(async (req, res) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const orders = await Order.find({
        orderDate: {
            $gte: today,
            $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
        }
    });

    res.status(200).json({
        success: true,
        message: 'Today\'s orders fetched successfully',
        data: orders
    });
});

// [GET] /api/v1/orders/:id
module.exports.getOrderById = controllerHandler(async (req, res) => {
    const { id } = req.params;
    const order = await Order.findById(id);
    
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
    
    const order = await Order.findByIdAndUpdate(
        id,
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
    
    const order = await Order.findByIdAndUpdate(
        id,
        { status: 'cancelled' },
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
        message: 'Order cancelled successfully',
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

// [GET] /api/v1/orders/restaurant/:restaurantId/today
module.exports.getRestaurantTodayOrders = controllerHandler(async (req, res) => {
    const { restaurantId } = req.params;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const orders = await Order.find({
        restaurantId,
        orderDate: {
            $gte: today,
            $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
        }
    });
    
    res.status(200).json({
        success: true,
        message: 'Restaurant\'s today orders fetched successfully',
        data: orders
    });
});

// [GET] /api/v1/orders/type/:orderType/today
module.exports.getTodayOrdersByType = controllerHandler(async (req, res) => {
    const { orderType } = req.params;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const orders = await Order.find({
        orderType,
        orderDate: {
            $gte: today,
            $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
        }
    });
    
    res.status(200).json({
        success: true,
        message: `Today's ${orderType} orders fetched successfully`,
        data: orders
    });
});


