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

// [POST] /api/v1/order-details/daily-summary
module.exports.createDailySummary = controllerHandler(async (req, res) => {
    const { restaurantId } = req.body;
    
    if (!restaurantId) {
        return res.status(400).json({
            success: false,
            message: 'Restaurant ID is required'
        });
    }

    // Set date to today
    const date = new Date();
    date.setHours(0, 0, 0, 0);

    // Check if summary already exists for today
    const existingSummary = await OrderDetail.findOne({ date, restaurantId });
    if (existingSummary) {
        return res.status(400).json({
            success: false,
            message: 'Daily summary already exists for today'
        });
    }

    const dailySummary = await OrderDetail.create({
        date,
        restaurantId,
        totalOrders: 0,
        dailyTotal: 0,
        paymentSummary: {
            cash: { count: 0, total: 0 },
            card: { count: 0, total: 0 }
        },
        orderTypeSummary: {
            dineIn: { count: 0, total: 0 },
            takeaway: { count: 0, total: 0 }
        }
    });

    res.status(201).json({
        success: true,
        message: 'Daily summary created successfully',
        data: dailySummary
    });
});

// [GET] /api/v1/order-details/today
module.exports.getTodaySummary = controllerHandler(async (req, res) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const summary = await OrderDetail.findOne({
        date: {
            $gte: today,
            $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
        }
    });

    if (!summary) {
        return res.status(404).json({
            success: false,
            message: 'No summary found for today'
        });
    }

    res.status(200).json({
        success: true,
        message: 'Today\'s summary fetched successfully',
        data: summary
    });
});

// [GET] /api/v1/order-details/restaurant/:restaurantId/today
module.exports.getRestaurantTodaySummary = controllerHandler(async (req, res) => {
    const { restaurantId } = req.params;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const summary = await OrderDetail.findOne({
        restaurantId,
        date: {
            $gte: today,
            $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
        }
    });

    if (!summary) {
        return res.status(404).json({
            success: false,
            message: 'No summary found for today'
        });
    }

    res.status(200).json({
        success: true,
        message: 'Restaurant\'s today summary fetched successfully',
        data: summary
    });
});

// [PATCH] /api/v1/order-details/update-payment
module.exports.updatePaymentSummary = controllerHandler(async (req, res) => {
    const { restaurantId, paymentMethod, amount } = req.body;
    
    if (!restaurantId || !paymentMethod || !amount) {
        return res.status(400).json({
            success: false,
            message: 'Missing required fields'
        });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const updateField = `paymentSummary.${paymentMethod}`;
    
    const summary = await OrderDetail.findOneAndUpdate(
        {
            restaurantId,
            date: {
                $gte: today,
                $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
            }
        },
        {
            $inc: {
                [`${updateField}.count`]: 1,
                [`${updateField}.total`]: amount,
                totalOrders: 1,
                dailyTotal: amount
            }
        },
        { new: true }
    );

    if (!summary) {
        return res.status(404).json({
            success: false,
            message: 'No summary found for today'
        });
    }

    res.status(200).json({
        success: true,
        message: 'Payment summary updated successfully',
        data: summary
    });
});

// [PATCH] /api/v1/order-details/update-order-type
module.exports.updateOrderTypeSummary = controllerHandler(async (req, res) => {
    const { restaurantId, orderType, amount } = req.body;
    
    if (!restaurantId || !orderType || !amount) {
        return res.status(400).json({
            success: false,
            message: 'Missing required fields'
        });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const updateField = `orderTypeSummary.${orderType === 'Dine-in' ? 'dineIn' : 'takeaway'}`;
    
    const summary = await OrderDetail.findOneAndUpdate(
        {
            restaurantId,
            date: {
                $gte: today,
                $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
            }
        },
        {
            $inc: {
                [`${updateField}.count`]: 1,
                [`${updateField}.total`]: amount
            }
        },
        { new: true }
    );

    if (!summary) {
        return res.status(404).json({
            success: false,
            message: 'No summary found for today'
        });
    }

    res.status(200).json({
        success: true,
        message: 'Order type summary updated successfully',
        data: summary
    });
});
