const router = require('express').Router();
const profileController = require('../../controllers/client/profile.controller');

router.get('/', profileController.index);
router.get('/edit', profileController.edit);

module.exports = router;
