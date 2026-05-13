const User = require('../../models/user.model');

module.exports.index = (req, res) => {
  res.render('client/pages/profile', {
    title: 'Hồ sơ cá nhân — FlashLearn',
    currentPage: 'profile'
  });
};

module.exports.editPost = async (req, res) => {
  try {
    const userId = parseInt(req.user.id);
    const { full_name } = req.body;

    const updates = { full_name, updated_at: new Date() };
    if (req.file) updates.avatar_url = req.file.path;

    const user = await User.findByPk(userId);
    await user.update(updates);

    res.redirect('/profile');
  } catch (error) {
    res.redirect('/profile');
  }
};
