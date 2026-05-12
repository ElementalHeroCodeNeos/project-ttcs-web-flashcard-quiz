module.exports.index = (req, res) => {
  res.render('client/pages/profile', { title: 'Hồ sơ cá nhân' });
};

module.exports.edit = (req, res) => {
  res.render('client/pages/profile-edit', { title: 'Chỉnh sửa thông tin' });
};
