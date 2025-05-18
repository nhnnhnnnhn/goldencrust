const userRoute = require('./user.route');
const authRoute = require('./auth.route');
const restaurantRoute = require('./restaurant.route');
const menuItemRoute = require('./menuItem.route');
const reservationRoute = require('./reservation.route');
const reservedTableRoute = require('./reservedTable.route');
const tableRoute = require('./table.route');
const paymentRoute = require('./payment.route');
const orderRoute = require('./order.route');
const orderDetailRoute = require('./orderDetail.route');
const stripeRoute = require('./stripe.routes');
const deliveryRoute = require('./delivery.route');
const categoryRoute = require('./category.route');
const chatRoute = require('./chat.routes');
const authMiddleware = require('../middlewares/auth.middleware');


module.exports = (app) => {
    const version = '/api/v1';

    app.use(version + '/auth', authRoute);
    
    // Protected routes
    app.use(version + '/users', authMiddleware, userRoute);
    app.use(version + '/restaurants', restaurantRoute);
    app.use(version + '/menu-items', menuItemRoute);
    app.use(version + '/reservations', authMiddleware, reservationRoute);
    app.use(version + '/reserved-tables', authMiddleware, reservedTableRoute);
    app.use(version + '/tables', authMiddleware, tableRoute);
    app.use(version + '/orders', orderRoute);
    app.use(version + '/order-details', authMiddleware, orderDetailRoute);
    app.use(version + '/deliveries', authMiddleware, deliveryRoute);
    // app.use(version + '/payments', authMiddleware, paymentRoute);
    app.use(version + '/stripe', stripeRoute);
    app.use(version + '/categories', categoryRoute);
    app.use(version + '/chat', chatRoute);
};