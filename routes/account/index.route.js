const router = require('express').Router();
const accountRoute = require('./account.route');

router.use('/', accountRoute);

module.exports = router;
