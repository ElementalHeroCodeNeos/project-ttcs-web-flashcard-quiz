const { Op } = require('sequelize');
const sequelize  = require('../../config/database');
const Deck       = require('../../models/deck.model');
const Card       = require('../../models/card.model');
const Category   = require('../../models/category.model');
const SavedDeck  = require('../../models/savedDeck.model');
const User       = require('../../models/user.model');

const LIMIT = 9;

module.exports.index = async (req, res) => {
  try {
    const userId     = res.locals.user ? parseInt(res.locals.user.id) : null;
    const keyword    = req.query.keyword    || '';
    const categoryId = req.query.category_id || '';
    const page       = parseInt(req.query.page) || 1;

    const where = { visibility: 'public', status: 'active' };
    if (categoryId) where.category_id = parseInt(categoryId);
    if (keyword)    where.title = { [Op.iLike]: `%${keyword}%` };

    const total      = await Deck.count({ where });
    const totalPages = Math.ceil(total / LIMIT) || 1;
    const currentPage = Math.min(page, totalPages);
    const offset      = (currentPage - 1) * LIMIT;

    const deckRows = await Deck.findAll({
      where,
      order: [['published_at', 'DESC']],
      limit: LIMIT,
      offset,
      raw: true
    });

    if (!deckRows.length) {
      const categories = await Category.findAll({ where: { status: 'active' }, order: [['position', 'DESC']], raw: true });
      return res.render('client/pages/explore', {
        title: 'Khám phá — FlashLearn',
        decks: [], categories, total, limit: LIMIT,
        page: currentPage, keyword, currentCategory: categoryId
      });
    }

    // Lấy tên danh mục
    const catIds = [...new Set(deckRows.map(d => parseInt(d.category_id)))];
    const catRows = await Category.findAll({ where: { id: { [Op.in]: catIds } }, attributes: ['id', 'name'], raw: true });
    const catMap  = Object.fromEntries(catRows.map(c => [parseInt(c.id), c.name]));

    // Lấy tên tác giả
    const ownerIds = [...new Set(deckRows.map(d => parseInt(d.owner_id)))];
    const userRows = await User.findAll({ where: { id: { [Op.in]: ownerIds } }, attributes: ['id', 'full_name'], raw: true });
    const userMap  = Object.fromEntries(userRows.map(u => [parseInt(u.id), u.full_name]));

    // Đếm số thẻ
    const deckIds = deckRows.map(d => parseInt(d.id));
    const countRows = await Card.findAll({
      where: { deck_id: { [Op.in]: deckIds }, status: 'active' },
      attributes: ['deck_id', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
      group: ['deck_id'],
      raw: true
    });
    const countMap = Object.fromEntries(countRows.map(r => [parseInt(r.deck_id), parseInt(r.count)]));

    // Kiểm tra deck đã lưu
    const savedSet = new Set();
    if (userId) {
      const savedRows = await SavedDeck.findAll({
        where: { user_id: userId, deck_id: { [Op.in]: deckIds }, status: 'active' },
        attributes: ['deck_id'],
        raw: true
      });
      savedRows.forEach(r => savedSet.add(parseInt(r.deck_id)));
    }

    const decks = deckRows.map(d => ({
      ...d,
      category_name: catMap[parseInt(d.category_id)] || '',
      author_name:   userMap[parseInt(d.owner_id)]   || '',
      card_count:    countMap[parseInt(d.id)]        || 0,
      is_saved:      savedSet.has(parseInt(d.id))
    }));

    const categories = await Category.findAll({ where: { status: 'active' }, order: [['position', 'DESC']], raw: true });

    res.render('client/pages/explore', {
      title: 'Khám phá — FlashLearn',
      decks, categories, total, limit: LIMIT,
      page: currentPage, keyword, currentCategory: categoryId
    });
  } catch (error) {
    res.redirect('/');
  }
};

module.exports.detail = async (req, res) => {
  try {
    const userId = res.locals.user ? parseInt(res.locals.user.id) : null;

    const deck = await Deck.findOne({
      where: { id: req.params.id, visibility: 'public', status: 'active' },
      raw: true
    });
    if (!deck) return res.redirect('/explore');

    const category = await Category.findOne({ where: { id: deck.category_id }, attributes: ['name'], raw: true });
    const author   = await User.findOne({ where: { id: deck.owner_id }, attributes: ['full_name'], raw: true });

    const cards = await Card.findAll({
      where: { deck_id: deck.id, status: 'active' },
      order: [['position', 'ASC'], ['created_at', 'ASC']],
      raw: true
    });

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
