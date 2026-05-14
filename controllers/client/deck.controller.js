const { Op, QueryTypes } = require('sequelize');
const sequelize = require('../../config/database');
const Deck      = require('../../models/deck.model');
const Card      = require('../../models/card.model');
const Category  = require('../../models/category.model');
const SavedDeck = require('../../models/savedDeck.model');

const LIMIT = 12;

// Subquery kiểm tra user đã lưu deck chưa, dùng lại ở WHERE và SELECT
const SAVED_EXISTS = `EXISTS (
  SELECT 1 FROM saved_decks sd
  WHERE sd.deck_id = d.id AND sd.user_id = :userId AND sd.status = 'active'
)`;

// Danh sách bộ thẻ của user (tự tạo + đã lưu), có lọc và phân trang
module.exports.list = async (req, res) => {
  try {
    const userId = parseInt(req.user.id);
    const { search = '', category_id = '', visibility = '', type = '' } = req.query;
    const page = parseInt(req.query.page) || 1;

    // Build điều kiện WHERE theo loại xem (tất cả / tự tạo / đã lưu)
    const conditions   = ["d.status != 'deleted'"];
    const replacements = { userId };

    if (type === 'created') {
      conditions.push('d.owner_id = :userId');
    } else if (type === 'saved') {
      conditions.push(SAVED_EXISTS);
    } else {
      conditions.push(`(d.owner_id = :userId OR ${SAVED_EXISTS})`);
    }

    if (category_id) {
      conditions.push('d.category_id = :categoryId');
      replacements.categoryId = parseInt(category_id);
    }
    if (visibility) {
      conditions.push('d.visibility = :visibility');
      replacements.visibility = visibility;
    }
    if (search) {
      conditions.push('d.title ILIKE :search');
      replacements.search = `%${search}%`;
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

    // Lấy deck kèm tên danh mục, số thẻ, trạng thái owner và đã lưu
    const deckRows = await sequelize.query(`
      SELECT d.*,
             c.name AS category_name,
             COUNT(DISTINCT ca.id) AS card_count,
             (d.owner_id = :userId) AS is_owner,
             ${SAVED_EXISTS} AS is_saved
      FROM decks d
      JOIN categories c  ON c.id = d.category_id
      LEFT JOIN cards ca ON ca.deck_id = d.id AND ca.status = 'active'
      WHERE ${where}
      GROUP BY d.id, c.name
      ORDER BY d.created_at DESC
      LIMIT :limit OFFSET :offset
    `, { replacements, type: QueryTypes.SELECT });

    // Reshape để Pug dùng deck.category.name, deck.cardCount, deck.isOwner, deck.isSaved
    const decks = deckRows.map(d => ({
      ...d,
      category:  { name: d.category_name },
      cardCount: parseInt(d.card_count),
      isOwner:   d.is_owner,
      isSaved:   d.is_saved
    }));

    // Danh sách danh mục cho bộ lọc
    const categories = await Category.findAll({
      where: { status: 'active' },
      order: [['position', 'DESC']],
      raw: true
    });

    res.render('client/pages/deck-list', {
      title: 'Bộ thẻ của tôi — FlashLearn',
      currentPage: 'deck',
      decks,
      categories,
      total: totalRecord,
      totalPages,
      page: currentPage,
      query: req.query
    });
  } catch (error) {
    res.redirect('/dashboard');
  }
};

// Hiển thị form tạo bộ thẻ mới
module.exports.create = async (req, res) => {
  try {
    const categories = await Category.findAll({
      where: { status: 'active' },
      order: [['position', 'DESC']],
      raw: true
    });
    res.render('client/pages/deck-create', {
      title: 'Tạo bộ thẻ — FlashLearn',
      currentPage: 'deck',
      categories
    });
  } catch (error) {
    res.redirect('/deck');
  }
};

// Xử lý tạo bộ thẻ mới
module.exports.createPost = async (req, res) => {
  try {
    const { title, description, category_id, visibility } = req.body;
    const isPublic = visibility === 'public';

    const deck = await Deck.create({
      owner_id:     req.user.id,
      category_id:  parseInt(category_id),
      title:        title.trim(),
      description:  description || null,
      visibility:   isPublic ? 'public' : 'private',
      published_at: isPublic ? new Date() : null,
      created_at:   new Date(),
      updated_at:   new Date()
    });

    res.redirect(`/deck/detail/${deck.id}`);
  } catch (error) {
    res.redirect('/deck/create');
  }
};

// Hiển thị form chỉnh sửa bộ thẻ (chỉ chủ sở hữu)
module.exports.edit = async (req, res) => {
  try {
    const userId = parseInt(req.user.id);
    const deck = await Deck.findOne({
      where: { id: req.params.id, owner_id: userId, status: { [Op.ne]: 'deleted' } },
      raw: true
    });
    if (!deck) return res.redirect('/deck');

    const categories = await Category.findAll({
      where: { status: 'active' },
      order: [['position', 'DESC']],
      raw: true
    });

    res.render('client/pages/deck-edit', {
      title: 'Chỉnh sửa bộ thẻ — FlashLearn',
      currentPage: 'deck',
      deck,
      categories
    });
  } catch (error) {
    res.redirect('/deck');
  }
};

// Xử lý cập nhật thông tin bộ thẻ
module.exports.editPost = async (req, res) => {
  try {
    const userId = parseInt(req.user.id);
    const { title, description, category_id, visibility } = req.body;

    const deck = await Deck.findOne({
      where: { id: req.params.id, owner_id: userId, status: { [Op.ne]: 'deleted' } }
    });
    if (!deck) return res.json({ code: 'error', message: 'Không tìm thấy bộ thẻ!' });

    const nowPublic  = visibility === 'public';
    const wasPrivate = deck.visibility === 'private';

    await deck.update({
      title:        title.trim(),
      description:  description || null,
      category_id:  parseInt(category_id),
      visibility:   nowPublic ? 'public' : 'private',
      // Chỉ set published_at lần đầu chuyển sang public
      published_at: nowPublic && wasPrivate ? new Date() : deck.published_at,
      updated_at:   new Date()
    });

    res.redirect(`/deck/detail/${deck.id}`);
  } catch (error) {
    res.redirect(`/deck/edit/${req.params.id}`);
  }
};

// Xoá mềm bộ thẻ (chỉ chủ sở hữu)
module.exports.deleteDelete = async (req, res) => {
  try {
    const userId = parseInt(req.user.id);
    const deck = await Deck.findOne({
      where: { id: req.params.id, owner_id: userId, status: { [Op.ne]: 'deleted' } }
    });
    if (!deck) return res.json({ code: 'error', message: 'Không tìm thấy bộ thẻ!' });

    await deck.update({ status: 'deleted', deleted_at: new Date() });
    res.json({ code: 'success', redirect: '/deck' });
  } catch (error) {
    res.json({ code: 'error', message: 'Xóa thất bại!' });
  }
};

// Chi tiết bộ thẻ: hiển thị thẻ, cho phép owner xem private
module.exports.detail = async (req, res) => {
  try {
    const userId = parseInt(req.user.id);
    const deck = await Deck.findOne({
      where: { id: req.params.id, status: { [Op.ne]: 'deleted' } },
      raw: true
    });
    if (!deck) return res.redirect('/deck');

    const isOwner = parseInt(deck.owner_id) === userId;

    // Deck private mà không phải owner → không được xem
    if (!isOwner && deck.visibility === 'private') return res.redirect('/deck');

    const cards = await Card.findAll({
      where: { deck_id: deck.id, status: 'active' },
      order: [['position', 'ASC'], ['created_at', 'ASC']],
      raw: true
    });

    const category = await Category.findOne({
      where: { id: deck.category_id },
      attributes: ['id', 'name'],
      raw: true
    });

    // Kiểm tra đã lưu chưa (chỉ check nếu không phải owner)
    let isSaved = false;
    if (!isOwner) {
      const saved = await SavedDeck.findOne({
        where: { user_id: userId, deck_id: deck.id, status: 'active' }
      });
      isSaved = saved !== null;
    }

    res.render('client/pages/deck-detail', {
      title: `${deck.title} — FlashLearn`,
      currentPage: 'deck',
      deck: { ...deck, category, cardCount: cards.length },
      cards,
      isOwner,
      isSaved
    });
  } catch (error) {
    res.redirect('/deck');
  }
};

// Lưu bộ thẻ công khai vào thư viện cá nhân
module.exports.savePost = async (req, res) => {
  try {
    const userId = parseInt(req.user.id);
    const deckId = parseInt(req.params.id);

    const deck = await Deck.findOne({
      where: { id: deckId, visibility: 'public', status: 'active' }
    });
    if (!deck) return res.json({ code: 'error', message: 'Bộ thẻ không tồn tại hoặc không công khai!' });

    if (parseInt(deck.owner_id) === userId) {
      return res.json({ code: 'error', message: 'Bạn là chủ sở hữu bộ thẻ này!' });
    }

    const existing = await SavedDeck.findOne({ where: { user_id: userId, deck_id: deckId } });

    if (!existing) {
      // Lưu lần đầu
      await SavedDeck.create({ user_id: userId, deck_id: deckId, saved_at: new Date() });
    } else if (existing.status === 'removed') {
      // Khôi phục nếu đã từng xoá
      await existing.update({ status: 'active', removed_at: null });
    } else {
      return res.json({ code: 'error', message: 'Bộ thẻ đã có trong thư viện!' });
    }

    res.json({ code: 'success', message: 'Đã lưu vào thư viện!' });
  } catch (error) {
    res.json({ code: 'error', message: 'Lưu thất bại!' });
  }
};
