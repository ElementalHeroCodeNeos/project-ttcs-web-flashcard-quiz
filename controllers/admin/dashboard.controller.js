const User = require('../../models/user.model');
const Deck = require('../../models/deck.model');
const Category = require('../../models/category.model');

module.exports.dashboard = async (req, res) => {
  const overview = {
    totalUser:       await User.count({ where: { role: 'user' } }),
    totalDeck:       await Deck.count({ where: {} }),
    totalPublicDeck: await Deck.count({ where: { visibility: 'public', status: 'active' } }),
    totalCategory:   await Category.count({ where: { status: 'active' } })
  };

  res.render('admin/pages/dashboard', {
    pageTitle: 'Tổng quan',
    overview
  });
};
