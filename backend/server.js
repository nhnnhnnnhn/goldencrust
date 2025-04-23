require('dotenv').config();
const express = require('express');
const database = require('./config/database');
const routes = require('./api/v1/routes/index.route');

const app = express();
const port = process.env.PORT;

database.connect();

app.use(express.json());


routes(app);

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});