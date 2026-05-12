module.exports.index = (req, res) => {
  res.render('client/pages/explore', { title: 'Khám phá' });
};

module.exports.detail = (req, res) => {
  res.render('client/pages/explore-detail', { title: 'Chi tiết bộ thẻ' });
};
