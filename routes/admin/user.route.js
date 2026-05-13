const router = require('express').Router();
const userController = require('../../controllers/admin/user.controller');

router.get('/list', userController.list);
router.get('/detail/:id', userController.detail);

module.exports = router;
