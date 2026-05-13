const STUB_DECKS = [
  { id: 1, category_id: 0, category_name: 'Ngoại ngữ',  title: 'IELTS Vocabulary Band 7+',  description: 'Từ vựng IELTS học thuật theo chủ đề, band 7.0 trở lên.',             card_count: 120, author_name: 'Trần Minh Khoa',   is_saved: false },
  { id: 2, category_id: 1, category_name: 'Toán học',    title: 'Giải tích 1 — Công thức',   description: 'Tổng hợp công thức giải tích, vi phân và tích phân cơ bản.',         card_count:  84, author_name: 'Lê Văn Đức',         is_saved: false },
  { id: 3, category_id: 3, category_name: 'Lịch sử',     title: 'Lịch sử Việt Nam 1945–1975',description: 'Các sự kiện lịch sử quan trọng giai đoạn kháng chiến.',              card_count:  56, author_name: 'Nguyễn Thị Hương',   is_saved: true  },
  { id: 4, category_id: 2, category_name: 'Lập trình',   title: 'Python cơ bản',             description: 'Syntax, built-in functions, OOP và các khái niệm cốt lõi Python.', card_count: 200, author_name: 'Phạm Quốc Bảo',     is_saved: false },
  { id: 5, category_id: 4, category_name: 'Khoa học',    title: 'Hóa học đại cương',         description: 'Bảng tuần hoàn, liên kết hóa học, phản ứng oxi hóa khử.',           card_count:  67, author_name: 'Hoàng Anh Tú',       is_saved: false },
  { id: 6, category_id: 5, category_name: 'Y khoa',      title: 'Giải phẫu học cơ bản',      description: 'Các cơ quan, hệ thống trong cơ thể người — giải phẫu học đại cương.',card_count: 150, author_name: 'Mai Thị Lan',         is_saved: false },
  { id: 7, category_id: 0, category_name: 'Ngoại ngữ',  title: 'N3 Kanji 漢字',              description: '800 kanji trình độ N3 theo JLPT, có ví dụ và âm đọc.',               card_count: 800, author_name: 'Đặng Minh Tuấn',     is_saved: false },
  { id: 8, category_id: 2, category_name: 'Lập trình',   title: 'SQL cơ bản đến nâng cao',   description: 'Các câu lệnh SQL từ SELECT cơ bản đến JOIN, subquery, index.',       card_count:  95, author_name: 'Vũ Thành Long',       is_saved: false },
  { id: 9, category_id: 1, category_name: 'Toán học',    title: 'Xác suất thống kê',         description: 'Công thức xác suất, phân phối chuẩn, kiểm định giả thuyết.',        card_count:  72, author_name: 'Bùi Thanh Hà',        is_saved: false }
];

const STUB_CATEGORIES = [
  { id: 0, name: 'Ngoại ngữ' }, { id: 1, name: 'Toán học' }, { id: 2, name: 'Lập trình' },
  { id: 3, name: 'Lịch sử' },   { id: 4, name: 'Khoa học' }, { id: 5, name: 'Y khoa' }
];

const LIMIT = 9;

module.exports.index = (req, res) => {
  const keyword     = req.query.keyword     || '';
  const categoryId  = req.query.category_id || '';
  const page        = parseInt(req.query.page) || 1;

  let decks = STUB_DECKS;
  if (keyword)    decks = decks.filter(d => d.title.toLowerCase().includes(keyword.toLowerCase()));
  if (categoryId) decks = decks.filter(d => String(d.category_id) === categoryId);

  const total = decks.length;
  const paged = decks.slice((page - 1) * LIMIT, page * LIMIT);

  res.render('client/pages/explore', {
    title:           'Khám phá',
    decks:           paged,
    categories:      STUB_CATEGORIES,
    total:           total,
    limit:           LIMIT,
    page:            page,
    keyword:         keyword,
    currentCategory: categoryId
  });
};

module.exports.detail = (req, res) => {
  const deck = STUB_DECKS.find(d => d.id === parseInt(req.params.id)) || STUB_DECKS[0];
  res.render('client/pages/explore-detail', {
    title: deck.title,
    deck:  deck,
    cards: [
      { front: 'abandon',     back: 'từ bỏ' },
      { front: 'accomplish',  back: 'hoàn thành, đạt được' },
      { front: 'ambiguous',   back: 'mơ hồ, không rõ ràng' },
      { front: 'controversy', back: 'tranh cãi, tranh luận' },
      { front: 'deteriorate', back: 'suy giảm, trở nên tệ hơn' },
      { front: 'elaborate',   back: 'chi tiết, tỉ mỉ' },
      { front: 'facilitate',  back: 'tạo điều kiện, thúc đẩy' },
      { front: 'inevitable',  back: 'không thể tránh khỏi' },
      { front: 'prominent',   back: 'nổi bật, quan trọng' },
      { front: 'substantial', back: 'đáng kể, quan trọng' }
    ]
  });
};
