module.exports.list = (req, res) => {
  res.render('admin/pages/category-list', {
    pageTitle: 'Quản lý danh mục',
    categoryList: [
      { id: 1, name: 'Tiếng Anh', description: 'Từ vựng và ngữ pháp tiếng Anh', position: 1, status: 'active' },
      { id: 2, name: 'Tiếng Nhật', description: 'Từ vựng Hiragana, Katakana, Kanji', position: 2, status: 'active' },
      { id: 3, name: 'Lập trình', description: 'Các khái niệm lập trình cơ bản', position: 3, status: 'inactive' }
    ]
  });
};

module.exports.create = (req, res) => {
  res.render('admin/pages/category-create', { pageTitle: 'Tạo danh mục' });
};

module.exports.edit = (req, res) => {
  res.render('admin/pages/category-edit', {
    pageTitle: 'Chỉnh sửa danh mục',
    category: { id: 1, name: 'Tiếng Anh', description: 'Từ vựng và ngữ pháp tiếng Anh', position: 1, status: 'active' }
  });
};
