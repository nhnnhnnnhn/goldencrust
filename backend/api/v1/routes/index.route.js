const userRoute = require('./user.route');
const authRoute = require('./auth.route');
const menuItemRoute = require('./menuItem.route');
const reservationRoute = require('./reservation.route');
const tableRoute = require('./table.route');
const reservedTableRoute = require('./reservedTable.route');

const authMiddleware = require('../middlewares/auth.middleware');

module.exports = (app) => {
    const version = '/api/v1';

    app.use(version + '/users', authMiddleware, userRoute);
    app.use(version + '/auth', authRoute);
    app.use(version + '/menu-items', menuItemRoute);
    app.use(version + '/reservations', reservationRoute);
    app.use(version + '/tables', tableRoute);
    app.use(version + '/reserved-tables', reservedTableRoute);
};