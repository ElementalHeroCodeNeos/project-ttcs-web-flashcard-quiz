const router = require('express').Router();
const categoryController = require('../../controllers/admin/category.controller');

router.get('/list', categoryController.list);
router.get('/create', categoryController.create);
router.post('/create', categoryController.createPost);
router.get('/edit/:id', categoryController.edit);
router.patch('/edit/:id', categoryController.editPatch);
router.patch('/change-status/:id', categoryController.changeStatusPatch);

module.exports = router;
