const express = require('express');
const router = express.Router();
const { router_cors } = require('../cors');
const PASSCODE = 'hello';

router.use(router_cors);

router.post("/access", (req, res) => {
  res.set('Access-Control-Allow-Credentials', 'true');
  res.header("Access-Control-Allow-Origin", req.headers.origin);
  if (req.body.passcode === PASSCODE)
    res.json({ access: 'success' });
  else
    res.json({ access: 'fail' });
});

module.exports = router;