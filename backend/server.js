const express = require('express');
const http = require('http');
const database = require('./config/database');
require('dotenv').config();
const cookieParser = require('cookie-parser');
const routes = require('./api/v1/routes/index.route');
const initWebSocket = require('./socket/webSocket'); 

const app = express();
const port = process.env.PORT || 3000;

database.connect();

app.use(express.json());
app.use(cookieParser());

routes(app);

const server = http.createServer(app);

initWebSocket(server);

server.listen(port, () => {
  console.log(`🚀 Server is running on http://localhost:${port}`);
});