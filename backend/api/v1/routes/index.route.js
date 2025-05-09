const userRoute = require('./user.route');
const authRoute = require('./auth.route');
const messageRoute = require('./message.route');
const notificationRoute = require('./notification.route');

const authMiddleware = require('../middlewares/auth.middleware');

module.exports = (app) => {
    const version = '/api/v1';

    app.use(version + '/users', authMiddleware, userRoute);

    app.use(version + '/auth', authRoute);

    app.use(version + '/messages', authMiddleware, messageRoute);

    app.use(version + '/notifications', authMiddleware, notificationRoute);
};