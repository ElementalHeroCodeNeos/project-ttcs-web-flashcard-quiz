-- FlashLearn Seed Data

-- ============================
-- CATEGORIES (10 danh mục — màu hardcode ở frontend theo category_id % 8)
-- 0=#3b82f6(xanh), 1=#8b5cf6(tím), 2=#06b6d4(cyan), 3=#f97316(cam)
-- 4=#10b981(xanh lá), 5=#ef4444(đỏ), 6=#ec4899(hồng), 7=#eab308(vàng)
-- ============================
INSERT INTO categories (name, description, position, status) VALUES
  ('Tiếng Anh',   'Từ vựng, ngữ pháp, luyện thi IELTS/TOEIC',        1,  'active'),
  ('Tiếng Nhật',  'Từ vựng, Kanji, ngữ pháp N5–N1',                   2,  'active'),
  ('Tiếng Hàn',   'Từ vựng, ngữ pháp TOPIK, hội thoại',               3,  'active'),
  ('Lập trình',   'Thuật toán, ngôn ngữ lập trình, framework',         4,  'active'),
  ('Y học',       'Thuật ngữ y khoa, dược lý, giải phẫu',             5,  'active'),
  ('Luật',        'Thuật ngữ pháp lý, kinh tế, tài chính',            6,  'active'),
  ('Khoa học',    'Toán, vật lý, hóa học, sinh học',                  7,  'active'),
  ('Lịch sử',     'Lịch sử Việt Nam và thế giới',                     8,  'active'),
  ('Văn học',     'Tác phẩm, tác giả, lý luận văn học',               9,  'active'),
  ('Khác',        'Các chủ đề không thuộc danh mục trên',             10, 'active');

-- ============================
-- ADMIN USER
-- password_hash bên dưới = bcrypt("Admin@123", 10)
-- ============================
INSERT INTO users (full_name, email, password_hash, role, status) VALUES
  ('Admin',         'admin@gmail.com',       '$2b$10$dEMj0YO7opcv7OHHqaZ8p.p5mSewsDmFf6TQrxv.UgrqvPUxVn49m', 'admin', 'active'),
  ('Nguyễn Văn An', 'vananabc@gmail.com',    '$2b$10$dEMj0YO7opcv7OHHqaZ8p.p5mSewsDmFf6TQrxv.UgrqvPUxVn49m', 'user',  'active'),
  ('Trần Thị Bảo',  'baotran@gmail.com',     '$2b$10$dEMj0YO7opcv7OHHqaZ8p.p5mSewsDmFf6TQrxv.UgrqvPUxVn49m', 'user',  'active');
