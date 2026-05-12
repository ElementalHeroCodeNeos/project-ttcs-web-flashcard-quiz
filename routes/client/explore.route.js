const router = require('express').Router();
const exploreController = require('../../controllers/client/explore.controller');

router.get('/', exploreController.index);
router.get('/:id', exploreController.detail);

module.exports = router;
