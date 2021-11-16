const cors = require('cors');

const path = 'http://localhost:3002';

const router_cors = cors({credentials: true, origin: path});
const socket_cors = {
  origin: path,
  methods: ["GET", "POST"],
};

module.exports = { router_cors, socket_cors };