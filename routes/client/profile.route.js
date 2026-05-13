const router = require('express').Router();
const profileController = require('../../controllers/client/profile.controller');

router.get('/', profileController.index);

module.exports = router;
