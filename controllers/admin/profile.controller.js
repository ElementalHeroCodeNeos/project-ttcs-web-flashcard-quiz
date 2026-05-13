const bcrypt = require('bcryptjs');
const User = require('../../models/user.model');

module.exports.edit = (req, res) => {
  res.render('admin/pages/profile', { pageTitle: 'Thông tin cá nhân' });
};

module.exports.editPatch = async (req, res) => {
  try {
    const updateData = {
      full_name: req.body.full_name,
      updated_at: new Date()
    };

    if (req.file) updateData.avatar_url = req.file.path;

    await User.update(updateData, { where: { id: req.user.id } });

    res.json({ code: 'success' });
  } catch (error) {
    res.json({ code: 'error' });
  }
};

module.exports.changePassword = (req, res) => {
  res.render('admin/pages/profile-change-password', { pageTitle: 'Đổi mật khẩu' });
};

module.exports.changePasswordPatch = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findOne({ where: { id: req.user.id } });
    const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isMatch) return res.json({ code: 'error', message: 'Mật khẩu hiện tại không đúng!' });

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(newPassword, salt);

    await User.update(
      { password_hash, updated_at: new Date() },
      { where: { id: req.user.id } }
    );

    res.json({ code: 'success' });
  } catch (error) {
    res.json({ code: 'error' });
  }
};
