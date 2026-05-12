module.exports.list = (req, res) => {
  res.render('client/pages/deck-list', { title: 'Bộ thẻ của tôi' });
};

module.exports.create = (req, res) => {
  res.render('client/pages/deck-create', { title: 'Tạo bộ thẻ' });
};

module.exports.edit = (req, res) => {
  res.render('client/pages/deck-edit', { title: 'Chỉnh sửa bộ thẻ' });
};

module.exports.detail = (req, res) => {
  res.render('client/pages/deck-detail', { title: 'Chi tiết bộ thẻ' });
};
