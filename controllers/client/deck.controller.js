module.exports.list = (req, res) => {
  const query = {
    search:      req.query.search      || '',
    category_id: req.query.category_id || '',
    visibility:  req.query.visibility  || '',
    type:        req.query.type        || ''
  };

  const mockDecks = [
    {
      id: 1,
      title: 'Từ vựng JLPT N3',
      description: 'Bộ thẻ 500 từ vựng tiếng Nhật cần thiết cho kỳ thi JLPT N3.',
      visibility: 'public',
      owner_id: res.locals.user ? res.locals.user.id : 1,
      category_id: 2,
      category: { name: 'Tiếng Nhật' },
      cardCount: 120
    },
    {
      id: 2,
      title: 'English Phrasal Verbs',
      description: 'Các cụm động từ tiếng Anh phổ biến trong giao tiếp hàng ngày.',
      visibility: 'public',
      owner_id: 99,
      category_id: 1,
      category: { name: 'Tiếng Anh' },
      cardCount: 85
    }
  ];

  const mockCategories = [
    { id: 1, name: 'Tiếng Anh' },
    { id: 2, name: 'Tiếng Nhật' },
    { id: 3, name: 'Tiếng Hàn' },
    { id: 4, name: 'Lập trình' }
  ];

  res.render('client/pages/deck-list', {
    title:       'Bộ thẻ của tôi — FlashLearn',
    currentPage: 'deck',
    decks:       mockDecks,
    categories:  mockCategories,
    total:       mockDecks.length,
    totalPages:  1,
    page:        parseInt(req.query.page) || 1,
    query
  });
};

module.exports.create = (req, res) => {
  res.render('client/pages/deck-create', { title: 'Tạo bộ thẻ' });
};

module.exports.edit = (req, res) => {
  res.render('client/pages/deck-edit', { title: 'Chỉnh sửa bộ thẻ' });
};

module.exports.detail = (req, res) => {
  const mockDeck = {
    id: 1,
    title: 'Từ vựng JLPT N3',
    description: 'Bộ thẻ 500 từ vựng tiếng Nhật cần thiết cho kỳ thi JLPT N3.',
    visibility: 'public',
    owner_id: res.locals.user ? res.locals.user.id : 1,
    category_id: 2,
    category: { name: 'Tiếng Nhật' },
    cardCount: 5
  };
  const mockCards = [
    { id: 1, front: '日本語', back: 'Tiếng Nhật' },
    { id: 2, front: '学生',   back: 'Học sinh' },
    { id: 3, front: '先生',   back: 'Giáo viên' },
    { id: 4, front: '学校',   back: 'Trường học' },
    { id: 5, front: '勉強',   back: 'Học tập' }
  ];
  res.render('client/pages/deck-detail', {
    title:       `${mockDeck.title} — FlashLearn`,
    currentPage: 'deck',
    deck:        mockDeck,
    cards:       mockCards
  });
};
