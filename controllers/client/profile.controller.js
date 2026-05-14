const User = require('../../models/user.model');

// Hiển thị trang hồ sơ cá nhân
module.exports.index = (req, res) => {
  res.render('client/pages/profile', {
    title: 'Hồ sơ cá nhân — FlashLearn',
    currentPage: 'profile'
  });
};

// Cập nhật họ tên và avatar
module.exports.editPost = async (req, res) => {
  try {
    const userId = parseInt(req.user.id);
    const { full_name } = req.body;

    const updates = { full_name, updated_at: new Date() };

    // Nếu có upload ảnh mới thì cập nhật avatar_url
    if (req.file) updates.avatar_url = req.file.path;

    const user = await User.findByPk(userId);
    await user.update(updates);

    res.redirect('/profile');
  } catch (error) {
    res.redirect('/profile');
  }
};
