const { Op } = require('sequelize');
const Deck        = require('../../models/deck.model');
const Card        = require('../../models/card.model');
const SavedDeck   = require('../../models/savedDeck.model');
const QuizSession = require('../../models/quizSession.model');
const QuizAnswer  = require('../../models/quizAnswer.model');

// Xáo trộn mảng theo Fisher-Yates
function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Kiểm tra quyền truy cập deck: owner, deck public, hoặc đã lưu
async function checkAccess(userId, deck) {
  if (parseInt(deck.owner_id) === userId) return true;
  if (deck.visibility === 'public') return true;
  const saved = await SavedDeck.findOne({
    where: { user_id: userId, deck_id: deck.id, status: 'active' }
  });
  return !!saved;
}

// Lưu kết quả một lần làm quiz (dùng chung cho cả trắc nghiệm và ghép cặp)
async function submitQuiz(req, res, quizType) {
  try {
    const userId  = parseInt(req.user.id);
    const deckId  = parseInt(req.params.id);
    const { answers } = req.body;

    const deck = await Deck.findOne({
      where: { id: deckId, status: { [Op.ne]: 'deleted' } }
    });
    if (!deck) return res.json({ code: 'error' });

    const correctCount = answers.filter(a => a.is_correct).length;
    const total        = answers.length;
    const score        = total > 0 ? parseFloat((correctCount / total * 100).toFixed(2)) : 0;

    // Tạo session quiz
    const attempt = await QuizSession.create({
      user_id:         userId,
      deck_id:         deckId,
      quiz_type:       quizType,
      status:          'submitted',
      total_questions: total,
      correct_count:   correctCount,
      score,
      started_at:      new Date(),
      submitted_at:    new Date()
    });

    // Lưu từng câu trả lời
    await QuizAnswer.bulkCreate(answers.map((a, i) => ({
      attempt_id:     attempt.id,
      card_id:        a.card_id || null,
      question_text:  a.question_text,
      correct_answer: a.correct_answer,
      user_answer:    a.user_answer || null,
      is_correct:     a.is_correct,
      position:       i
    })));

    res.json({ attemptId: attempt.id });
  } catch (error) {
    res.json({ code: 'error' });
  }
}

// Hiển thị trang quiz trắc nghiệm 4 đáp án
module.exports.choice = async (req, res) => {
  try {
    const userId = parseInt(req.user.id);
    const deckId = parseInt(req.params.id);

    const deck = await Deck.findOne({
      where: { id: deckId, status: { [Op.ne]: 'deleted' } },
      raw: true
    });
    if (!deck || !(await checkAccess(userId, deck))) return res.redirect('/deck');

    const cards = await Card.findAll({
      where: { deck_id: deckId, status: 'active' },
      raw: true
    });

    // Cần ít nhất 4 thẻ để tạo 4 đáp án
    if (cards.length < 4) return res.redirect(`/deck/detail/${deckId}`);

    // Tạo câu hỏi: mỗi thẻ là 1 câu, 3 đáp án sai lấy ngẫu nhiên từ các thẻ còn lại
    const allBacks = cards.map(c => c.back);
    const questions = shuffle(cards).map(c => {
      const wrongs  = shuffle(allBacks.filter(b => b !== c.back)).slice(0, 3);
      return {
        card_id:        c.id,
        question_text:  c.front,
        correct_answer: c.back,
        answer_options: shuffle([c.back, ...wrongs])
      };
    });

    res.render('client/pages/quiz-choice', {
      title: `Trắc nghiệm — ${deck.title}`,
      deck,
      questions
    });
  } catch (error) {
    res.redirect('/deck');
  }
};

// Nộp kết quả quiz trắc nghiệm
module.exports.choiceSubmit = (req, res) => submitQuiz(req, res, 'multiple_choice');

// Hiển thị trang quiz ghép cặp (tối đa 8 thẻ ngẫu nhiên)
module.exports.match = async (req, res) => {
  try {
    const userId = parseInt(req.user.id);
    const deckId = parseInt(req.params.id);

    const deck = await Deck.findOne({
      where: { id: deckId, status: { [Op.ne]: 'deleted' } },
      raw: true
    });
    if (!deck || !(await checkAccess(userId, deck))) return res.redirect('/deck');

    const allCards = await Card.findAll({
      where: { deck_id: deckId, status: 'active' },
      raw: true
    });

    // Cần ít nhất 2 thẻ để ghép cặp
    if (allCards.length < 2) return res.redirect(`/deck/detail/${deckId}`);

    // Chọn ngẫu nhiên tối đa 8 thẻ
    const cards = shuffle(allCards).slice(0, 8).map(c => ({
      card_id: c.id,
      front:   c.front,
      back:    c.back
    }));

    res.render('client/pages/quiz-match', {
      title: `Quiz ghép cặp — ${deck.title}`,
      deck,
      cards
    });
  } catch (error) {
    res.redirect('/deck');
  }
};

// Nộp kết quả quiz ghép cặp
module.exports.matchSubmit = (req, res) => submitQuiz(req, res, 'matching');

// Hiển thị trang kết quả sau khi làm quiz
module.exports.result = async (req, res) => {
  try {
    const userId = parseInt(req.user.id);

    const attempt = await QuizSession.findOne({
      where: { id: req.params.attemptId, user_id: userId },
      raw: true
    });
    if (!attempt) return res.redirect('/deck');

    const deck = await Deck.findOne({
      where: { id: attempt.deck_id },
      raw: true
    });

    // Lấy từng câu trả lời để hiển thị chi tiết kết quả
    const items = await QuizAnswer.findAll({
      where: { attempt_id: attempt.id },
      order: [['position', 'ASC']],
      raw: true
    });

    res.render('client/pages/quiz-result', {
      title: 'Kết quả quiz — FlashLearn',
      deck,
      attempt,
      items
    });
  } catch (error) {
    res.redirect('/deck');
  }
};
