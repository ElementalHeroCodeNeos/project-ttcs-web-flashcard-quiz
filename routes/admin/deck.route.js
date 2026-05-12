const router = require('express').Router();
const deckController = require('../../controllers/admin/deck.controller');

router.get('/list', deckController.list);

module.exports = router;
