const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const nms = require('./streaming');
const httpServer = require('./socket');
const userRouter = require('./routes/user');
const adminRouter = require('./routes/admin');

const PORT = 9000;
const SOCKET_PORT = 8080;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use('/api/user', userRouter);
app.use('/api/admin', adminRouter);

app.listen(PORT, () => console.log(`listening on port ${PORT}`));
httpServer.listen(SOCKET_PORT);
nms.run();
