const router = require('express').Router();
const deckController = require('../../controllers/client/deck.controller');
const studyController = require('../../controllers/client/study.controller');
const quizController = require('../../controllers/client/quiz.controller');

router.get('/', deckController.list);
router.get('/create', deckController.create);
router.get('/edit/:id', deckController.edit);
router.get('/detail/:id', deckController.detail);

router.get('/study/:id', studyController.study);

router.get('/quiz/choice/:id', quizController.choice);
router.post('/quiz/choice/:id', quizController.choiceSubmit);
router.get('/quiz/match/:id', quizController.match);
router.post('/quiz/match/:id', quizController.matchSubmit);
router.get('/quiz/result/:attemptId', quizController.result);

module.exports = router;
