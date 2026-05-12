const router = require('express').Router();
const categoryController = require('../../controllers/admin/category.controller');

router.get('/list', categoryController.list);
router.get('/create', categoryController.create);
router.get('/edit/:id', categoryController.edit);

module.exports = router;
