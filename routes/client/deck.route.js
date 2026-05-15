const router = require('express').Router();
const deckController = require('../../controllers/client/deck.controller');
const studyController = require('../../controllers/client/study.controller');
const quizController  = require('../../controllers/client/quiz.controller');
const cardController  = require('../../controllers/client/card.controller');

router.get('/',          deckController.list);
router.get('/create',    deckController.create);
router.post('/create',   deckController.createPost);

router.get('/edit/:id',  deckController.edit);
router.post('/edit/:id', deckController.editPost);

router.delete('/delete/:id', deckController.deleteDelete);

router.get('/detail/:id', deckController.detail);
router.post('/:id/card',        cardController.createPost);
router.patch('/:id/card/:cid',  cardController.editPatch);
router.delete('/:id/card/:cid', cardController.deleteDelete);

router.patch('/:id/visibility', deckController.visibilityPatch);
router.post('/:id/save',   deckController.savePost);
router.delete('/:id/save', deckController.unsaveDelete);

router.get('/study/:id',        studyController.study);
router.get('/due/:id',          studyController.studyDeckDue);

router.get('/quiz/choice/:id',  quizController.choice);
router.post('/quiz/choice/:id', quizController.choiceSubmit);
router.get('/quiz/match/:id',   quizController.match);
router.post('/quiz/match/:id',  quizController.matchSubmit);
router.get('/quiz/result/:attemptId', quizController.result);

module.exports = router;
