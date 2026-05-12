module.exports.choice = (req, res) => {
  res.render('client/pages/quiz-choice', { title: 'Trắc nghiệm' });
};

module.exports.choiceResult = (req, res) => {
  res.render('client/pages/quiz-choice-result', { title: 'Kết quả trắc nghiệm' });
};

module.exports.match = (req, res) => {
  res.render('client/pages/quiz-match', { title: 'Quiz ghép cặp' });
};
