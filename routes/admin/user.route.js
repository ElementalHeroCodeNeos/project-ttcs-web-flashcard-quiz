const router = require('express').Router();
const userController = require('../../controllers/admin/user.controller');

router.get('/list', userController.list);
router.get('/detail/:id', userController.detail);
router.patch('/change-status/:id', userController.changeStatusPatch);

module.exports = router;
