const router = require('express').Router();
const profileController = require('../../controllers/admin/profile.controller');

router.get('/', profileController.index);
router.get('/change-password', profileController.changePassword);

module.exports = router;
