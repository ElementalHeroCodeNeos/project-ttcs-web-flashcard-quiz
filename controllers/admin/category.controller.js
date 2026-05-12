module.exports.list = (req, res) => {
  res.render('admin/pages/category-list', { title: 'Danh mục' });
};

module.exports.create = (req, res) => {
  res.render('admin/pages/category-create', { title: 'Tạo danh mục' });
};

module.exports.edit = (req, res) => {
  res.render('admin/pages/category-edit', { title: 'Chỉnh sửa danh mục' });
};
