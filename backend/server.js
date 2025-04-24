const express = require('express');
const database = require('./config/database');
require('dotenv').config();
const cookieParser = require('cookie-parser');
const routes = require('./api/v1/routes/index.route');

const app = express();
const port = process.env.PORT;

database.connect();

app.use(express.json());

app.use(cookieParser());
routes(app);

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});