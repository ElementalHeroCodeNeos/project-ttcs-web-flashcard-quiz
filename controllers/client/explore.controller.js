const { QueryTypes } = require('sequelize');
const sequelize  = require('../../config/database');
const Deck       = require('../../models/deck.model');
const Card       = require('../../models/card.model');
const Category   = require('../../models/category.model');
const SavedDeck  = require('../../models/savedDeck.model');
const User       = require('../../models/user.model');

const LIMIT = 9;

// Danh sách bộ thẻ công khai, có lọc theo danh mục và từ khoá
module.exports.index = async (req, res) => {
  try {
    const userId     = res.locals.user ? parseInt(res.locals.user.id) : null;
    const keyword    = req.query.keyword     || '';
    const categoryId = req.query.category_id || '';
    const page       = parseInt(req.query.page) || 1;

    // Build điều kiện WHERE động theo filter
    const conditions   = ["d.visibility = 'public'", "d.status = 'active'"];
    const replacements = { userId: userId || 0 };

    if (categoryId) {
      conditions.push('d.category_id = :categoryId');
      replacements.categoryId = parseInt(categoryId);
    }
    if (keyword) {
      conditions.push('d.title ILIKE :keyword');
      replacements.keyword = `%${keyword}%`;
    }

    const where = conditions.join(' AND ');

    // Đếm tổng để tính phân trang
    const [{ total }] = await sequelize.query(
      `SELECT COUNT(*) AS total FROM decks d WHERE ${where}`,
      { replacements, type: QueryTypes.SELECT }
    );

    const totalRecord = parseInt(total);
    const totalPages  = Math.ceil(totalRecord / LIMIT) || 1;
    const currentPage = Math.min(page, totalPages);

    replacements.limit  = LIMIT;
    replacements.offset = (currentPage - 1) * LIMIT;

    // Lấy danh sách deck kèm danh mục, tác giả, số thẻ, trạng thái đã lưu
    const decks = await sequelize.query(`
      SELECT d.*,
             c.name      AS category_name,
             u.full_name AS author_name,
             COUNT(DISTINCT ca.id) AS card_count,
             EXISTS (
               SELECT 1 FROM saved_decks sd
               WHERE sd.deck_id = d.id AND sd.user_id = :userId AND sd.status = 'active'
             ) AS is_saved
      FROM decks d
      JOIN categories c  ON c.id = d.category_id
      JOIN users u       ON u.id = d.owner_id
      LEFT JOIN cards ca ON ca.deck_id = d.id AND ca.status = 'active'
      WHERE ${where}
      GROUP BY d.id, c.name, u.full_name
      ORDER BY d.published_at DESC
      LIMIT :limit OFFSET :offset
    `, { replacements, type: QueryTypes.SELECT });

    // Lấy danh sách danh mục cho bộ lọc
    const categories = await Category.findAll({
      where: { status: 'active' },
      order: [['position', 'DESC']],
      raw: true
    });

    res.render('client/pages/explore', {
      title: 'Khám phá — FlashLearn',
      decks, categories,
      total: totalRecord, limit: LIMIT,
      page: currentPage, keyword, currentCategory: categoryId
    });
  } catch (error) {
    res.redirect('/');
  }
};

// Chi tiết một bộ thẻ công khai
module.exports.detail = async (req, res) => {
  try {
    const userId = res.locals.user ? parseInt(res.locals.user.id) : null;

    // Chỉ hiển thị deck public và đang active
    const deck = await Deck.findOne({
      where: { id: req.params.id, visibility: 'public', status: 'active' },
      raw: true
    });
    if (!deck) return res.redirect('/explore');

    const category = await Category.findOne({ where: { id: deck.category_id }, attributes: ['name'], raw: true });
    const author   = await User.findOne({ where: { id: deck.owner_id }, attributes: ['full_name'], raw: true });

    // Lấy danh sách thẻ theo thứ tự position
    const cards = await Card.findAll({
      where: { deck_id: deck.id, status: 'active' },
      order: [['position', 'ASC'], ['created_at', 'ASC']],
      raw: true
    });

    // Kiểm tra user đã lưu deck này chưa (chỉ check nếu không phải chủ sở hữu)
    let is_saved = false;
    if (userId && parseInt(deck.owner_id) !== userId) {
      const saved = await SavedDeck.findOne({
        where: { user_id: userId, deck_id: deck.id, status: 'active' }
      });
      is_saved = !!saved;
    }

    res.render('client/pages/explore-detail', {
      title: `${deck.title} — FlashLearn`,
      deck: {
        ...deck,
        category_name: category ? category.name : '',
        author_name:   author   ? author.full_name : '',
        card_count:    cards.length,
        is_saved
      },
      cards
    });
  } catch (error) {
    res.redirect('/explore');
  }
};
