module.exports.study = (req, res) => {
  res.render('client/pages/study', {
    title: 'Ôn tập — FlashLearn',
    currentPage: 'deck',
    deck: { id: req.params.id, title: 'Bộ thẻ' },
    cards: [
      { id: 1, front: 'abandon', back: 'từ bỏ', studyProgress: { repetitions: 0, interval_days: 0, ease_factor: 2.5 } },
      { id: 2, front: 'benefit', back: 'lợi ích', studyProgress: { repetitions: 1, interval_days: 1, ease_factor: 2.5 } },
      { id: 3, front: 'consequence', back: 'hậu quả', studyProgress: { repetitions: 0, interval_days: 0, ease_factor: 2.5 } }
    ]
  });
};

module.exports.studyDue = (req, res) => {
  res.render('client/pages/study', {
    title: 'Ôn tập thẻ đến hạn — FlashLearn',
    currentPage: 'deck',
    deck: { id: 0, title: 'Thẻ đến hạn hôm nay' },
    cards: []
  });
};
