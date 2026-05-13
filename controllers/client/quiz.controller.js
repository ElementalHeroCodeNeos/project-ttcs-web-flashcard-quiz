module.exports.choice = (req, res) => {
  res.render('client/pages/quiz-choice', {
    title: 'Trắc nghiệm',
    deck: { id: req.params.id, title: 'Bộ thẻ' },
    questions: [
      { card_id: 1, question_text: 'abandon',     correct_answer: 'từ bỏ',       answer_options: ['chấp nhận', 'từ bỏ', 'phát triển', 'thu thập'] },
      { card_id: 2, question_text: 'benefit',      correct_answer: 'lợi ích',     answer_options: ['thiệt hại', 'lợi ích', 'nguy hiểm', 'giải pháp'] },
      { card_id: 3, question_text: 'consequence',  correct_answer: 'hậu quả',     answer_options: ['nguyên nhân', 'kết quả tốt', 'hậu quả', 'điều kiện'] },
      { card_id: 4, question_text: 'deteriorate',  correct_answer: 'suy giảm',    answer_options: ['cải thiện', 'suy giảm', 'duy trì', 'tăng trưởng'] }
    ]
  });
};

module.exports.result = (req, res) => {
  res.render('client/pages/quiz-result', {
    title: 'Kết quả',
    deck: { id: 1, title: 'Bộ thẻ' },
    attempt: { quiz_type: 'multiple_choice', correct_count: 3, total_questions: 4 },
    items: [
      { question_text: 'abandon',    correct_answer: 'từ bỏ',    user_answer: 'chấp nhận', is_correct: false },
      { question_text: 'benefit',    correct_answer: 'lợi ích',  user_answer: 'lợi ích',   is_correct: true  },
      { question_text: 'consequence',correct_answer: 'hậu quả',  user_answer: 'hậu quả',   is_correct: true  },
      { question_text: 'deteriorate',correct_answer: 'suy giảm', user_answer: 'suy giảm',  is_correct: true  }
    ]
  });
};

module.exports.match = (req, res) => {
  res.render('client/pages/quiz-match', {
    title: 'Quiz ghép cặp',
    deck: { id: req.params.id, title: 'IELTS Vocabulary Band 7+' },
    cards: [
      { card_id: 1, front: 'abandon',     back: 'từ bỏ' },
      { card_id: 2, front: 'accomplish',  back: 'hoàn thành' },
      { card_id: 3, front: 'ambiguous',   back: 'mơ hồ' },
      { card_id: 4, front: 'controversy', back: 'tranh cãi' },
      { card_id: 5, front: 'deteriorate', back: 'suy giảm' },
      { card_id: 6, front: 'elaborate',   back: 'chi tiết, tỉ mỉ' }
    ]
  });
};

module.exports.choiceSubmit = (req, res) => {
  res.json({ attemptId: 'stub-choice-123' });
};

module.exports.matchSubmit = (req, res) => {
  res.json({ attemptId: 'stub-match-456' });
};
