const userRoute = require('./user.route');
const authRoute = require('./auth.route');

const authMiddleware = require('../middlewares/auth.middleware');

module.exports = (app) => {
    const version = '/api/v1';

    // app.use(version + '/users', authMiddleware, userRoute);

    app.use(version + '/auth', authRoute);
};