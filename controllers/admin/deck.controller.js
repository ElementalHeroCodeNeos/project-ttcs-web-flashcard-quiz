module.exports.list = (req, res) => {
  res.render('admin/pages/deck-list', {
    pageTitle: 'Quản lý bộ thẻ',
    deckList: [
      { id: 1, title: 'TOEIC 600+', category: { name: 'Tiếng Anh' }, owner: { full_name: 'Nguyễn Văn An' }, card_count: 120, save_count: 34, status: 'active' },
      { id: 2, title: 'JLPT N5', category: { name: 'Tiếng Nhật' }, owner: { full_name: 'Trần Thị Bình' }, card_count: 80, save_count: 12, status: 'hidden' }
    ],
    categoryList: [
      { id: 1, name: 'Tiếng Anh' },
      { id: 2, name: 'Tiếng Nhật' },
      { id: 3, name: 'Lập trình' }
    ],
    pagination: { skip: 0, totalRecord: 2, totalPage: 1, currentPage: 1 }
  });
};
