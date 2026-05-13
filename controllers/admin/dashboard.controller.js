module.exports.index = (req, res) => {
  res.render('admin/pages/dashboard', {
    pageTitle: 'Tổng quan',
    overview: {
      totalUser: 128,
      totalDeck: 340,
      totalPublicDeck: 95,
      totalCategory: 8
    }
  });
};
