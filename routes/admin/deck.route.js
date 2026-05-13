const router = require('express').Router();
const deckController = require('../../controllers/admin/deck.controller');

router.get('/list', deckController.list);
router.patch('/change-status/:id', deckController.changeStatusPatch);

module.exports = router;
