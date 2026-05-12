const router = require('express').Router();
const deckController = require('../../controllers/client/deck.controller');
const studyController = require('../../controllers/client/study.controller');
const quizController = require('../../controllers/client/quiz.controller');

router.get('/', deckController.list);
router.get('/create', deckController.create);
router.get('/edit/:id', deckController.edit);
router.get('/detail/:id', deckController.detail);

router.get('/study/:id', studyController.index);

router.get('/quiz/choice/:id', quizController.choice);
router.get('/quiz/choice/result/:id', quizController.choiceResult);
router.get('/quiz/match/:id', quizController.match);

module.exports = router;
