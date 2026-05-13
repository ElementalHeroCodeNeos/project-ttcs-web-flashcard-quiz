module.exports.index = (req, res) => {
  res.render('admin/pages/profile', { pageTitle: 'Thông tin cá nhân' });
};

module.exports.changePassword = (req, res) => {
  res.render('admin/pages/profile-change-password', { pageTitle: 'Đổi mật khẩu' });
};
