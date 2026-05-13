module.exports.index = (req, res) => {
  if (res.locals.user) {
    return res.redirect('/dashboard');
  }

  // stub data — thay bằng query DB khi models xong
  const stats = { deckCount: 0, userCount: 0, cardCount: 0 };
  const featuredDecks = [];

  res.render('client/pages/home', {
    title: 'FlashLearn — Học thông minh hơn mỗi ngày',
    stats,
    featuredDecks
  });
};
