const { Op } = require('sequelize');
const sequelize = require('../../config/database');
const Deck = require('../../models/deck.model');
const Card = require('../../models/card.model');
const Category = require('../../models/category.model');
const SavedDeck = require('../../models/savedDeck.model');

const LIMIT = 12;

module.exports.list = async (req, res) => {
  try {
    const userId = parseInt(req.user.id);
    const { search = '', category_id = '', visibility = '', type = '' } = req.query;
    const page = parseInt(req.query.page) || 1;

    // Lấy danh sách deck đã lưu của user
    const savedRows = await SavedDeck.findAll({
      where: { user_id: userId, status: 'active' },
      attributes: ['deck_id'],
      raw: true
    });
    const savedIds = savedRows.map(r => parseInt(r.deck_id));

    // Build where theo type
    const where = { status: { [Op.ne]: 'deleted' } };
    if (type === 'created') {
      where.owner_id = userId;
    } else if (type === 'saved') {
      where.id = { [Op.in]: savedIds.length ? savedIds : [0] };
    } else {
      if (savedIds.length > 0) {
        where[Op.or] = [{ owner_id: userId }, { id: { [Op.in]: savedIds } }];
      } else {
        where.owner_id = userId;
      }
    }

    if (category_id) where.category_id = parseInt(category_id);
    if (visibility)  where.visibility = visibility;
    if (search)      where.title = { [Op.iLike]: `%${search}%` };

    // Phân trang
    const total = await Deck.count({ where });
    const totalPages = Math.ceil(total / LIMIT) || 1;
    const currentPage = Math.min(page, totalPages);
    const offset = (currentPage - 1) * LIMIT;

    const deckRows = await Deck.findAll({
      where,
      order: [['created_at', 'DESC']],
      limit: LIMIT,
      offset,
      raw: true
    });

    // Lấy tên danh mục
    const catIds = [...new Set(deckRows.map(d => parseInt(d.category_id)))];
    const catMap = {};
    if (catIds.length > 0) {
      const catRows = await Category.findAll({
        where: { id: { [Op.in]: catIds } },
        attributes: ['id', 'name'],
        raw: true
      });
      catRows.forEach(c => { catMap[parseInt(c.id)] = c.name; });
    }

    // Đếm số thẻ của mỗi deck
    const deckIds = deckRows.map(d => parseInt(d.id));
    const countMap = {};
    if (deckIds.length > 0) {
      const countRows = await Card.findAll({
        where: { deck_id: { [Op.in]: deckIds }, status: 'active' },
        attributes: ['deck_id', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
        group: ['deck_id'],
        raw: true
      });
      countRows.forEach(r => { countMap[parseInt(r.deck_id)] = parseInt(r.count); });
    }

    const savedSet = new Set(savedIds);
    const decks = deckRows.map(d => ({
      ...d,
      category: { name: catMap[parseInt(d.category_id)] || '' },
      cardCount: countMap[parseInt(d.id)] || 0,
      isOwner: parseInt(d.owner_id) === userId,
      isSaved: savedSet.has(parseInt(d.id))
    }));

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
      total,
      totalPages,
      page: currentPage,
      query: req.query
    });
  } catch (error) {
    res.redirect('/dashboard');
  }
};

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

module.exports.editPost = async (req, res) => {
  try {
    const userId = parseInt(req.user.id);
    const { title, description, category_id, visibility } = req.body;

    const deck = await Deck.findOne({
      where: { id: req.params.id, owner_id: userId, status: { [Op.ne]: 'deleted' } }
    });
    if (!deck) return res.json({ code: 'error', message: 'Không tìm thấy bộ thẻ!' });

    const nowPublic = visibility === 'public';
    const wasPrivate = deck.visibility === 'private';

    await deck.update({
      title:        title.trim(),
      description:  description || null,
      category_id:  parseInt(category_id),
      visibility:   nowPublic ? 'public' : 'private',
      published_at: nowPublic && wasPrivate ? new Date() : deck.published_at,
      updated_at:   new Date()
    });

    res.redirect(`/deck/detail/${deck.id}`);
  } catch (error) {
    res.redirect(`/deck/edit/${req.params.id}`);
  }
};

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

    let isSaved = false;
    if (!isOwner) {
      const saved = await SavedDeck.findOne({
        where: { user_id: userId, deck_id: deck.id, status: 'active' }
      });
      isSaved = !!saved;
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
      await SavedDeck.create({ user_id: userId, deck_id: deckId, saved_at: new Date() });
    } else if (existing.status === 'removed') {
      await existing.update({ status: 'active', removed_at: null });
    } else {
      return res.json({ code: 'error', message: 'Bộ thẻ đã có trong thư viện!' });
    }

    res.json({ code: 'success', message: 'Đã lưu vào thư viện!' });
  } catch (error) {
    res.json({ code: 'error', message: 'Lưu thất bại!' });
  }
};
