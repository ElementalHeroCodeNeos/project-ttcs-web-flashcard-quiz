const { QueryTypes } = require('sequelize');
const sequelize = require('../../config/database');

// Hiển thị trang chủ cho guest (user đã đăng nhập → redirect dashboard)
module.exports.index = async (req, res) => {
  try {
    if (res.locals.user) {
      return res.redirect('/dashboard');
    }

    // Số liệu thống kê hiển thị trên hero section (stub data)
    const stats = { deckCount: 15000, userCount: 150000, cardCount: 5000000 };

    // Lấy 8 bộ thẻ công khai mới nhất kèm danh mục, tác giả, số thẻ
    const featuredDecks = await sequelize.query(`
      SELECT d.*,
             c.name       AS category_name,
             u.full_name  AS author_name,
             COUNT(DISTINCT ca.id) AS card_count
      FROM decks d
      JOIN categories c  ON c.id = d.category_id
      JOIN users u       ON u.id = d.owner_id
      LEFT JOIN cards ca ON ca.deck_id = d.id AND ca.status = 'active'
      WHERE d.visibility = 'public' AND d.status = 'active'
      GROUP BY d.id, c.name, u.full_name
      ORDER BY d.published_at DESC
      LIMIT 8
    `, { type: QueryTypes.SELECT });

    res.render('client/pages/home', {
      title: 'FlashLearn — Học thông minh hơn mỗi ngày',
      stats,
      featuredDecks
    });
  } catch (error) {
    res.redirect('/');
  }
};
