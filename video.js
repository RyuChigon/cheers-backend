const express = require("express");
const app = express();
const nms = require('./streaming');
const bodyParser = require("body-parser");
const archiveRouter = require('./routes/archive');

const PORT = 7000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use('/api/archive', archiveRouter);

app.listen(PORT, () => console.log(`listening on port ${PORT}`));
nms.run();
