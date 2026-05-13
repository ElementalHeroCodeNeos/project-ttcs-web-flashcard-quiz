module.exports.list = (req, res) => {
  res.render('admin/pages/user-list', {
    pageTitle: 'Quản lý người dùng',
    userList: [
      { id: 1, full_name: 'Nguyễn Văn An', email: 'an@gmail.com', avatar_url: '', deck_count: 5, status: 'active', created_at: new Date() },
      { id: 2, full_name: 'Trần Thị Bình', email: 'binh@gmail.com', avatar_url: '', deck_count: 2, status: 'locked', created_at: new Date() }
    ],
    pagination: { skip: 0, totalRecord: 2, totalPage: 1, currentPage: 1 }
  });
};

module.exports.detail = (req, res) => {
  res.render('admin/pages/user-detail', {
    pageTitle: 'Chi tiết người dùng',
    userDetail: { id: 1, full_name: 'Nguyễn Văn An', email: 'an@gmail.com', deck_count: 5, status: 'active', created_at: new Date() },
    deckList: [
      { title: 'TOEIC Vocabulary 600+', category: { name: 'Tiếng Anh' }, card_count: 120, status: 'active' }
    ]
  });
};
