const router = require('express').Router();
const dashboardController = require('../../controllers/client/dashboard.controller');

router.get('/', dashboardController.index);

module.exports = router;
