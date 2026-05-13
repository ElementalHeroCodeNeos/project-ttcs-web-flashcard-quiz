const { QueryTypes } = require('sequelize');
const sequelize = require('../../config/database');
const User = require('../../models/user.model');
const Deck = require('../../models/deck.model');
const Category = require('../../models/category.model');

module.exports.list = async (req, res) => {
  const limitItems = 10;
  let page = parseInt(req.query.page) || 1;

  const conditions = ["u.role = 'user'"];
  const replacements = {};

  if (req.query.status) {
    conditions.push('u.status = :status');
    replacements.status = req.query.status;
  }

  if (req.query.keyword) {
    conditions.push('(u.full_name ILIKE :keyword OR u.email ILIKE :keyword)');
    replacements.keyword = `%${req.query.keyword}%`;
  }

  const where = conditions.join(' AND ');

  const [{ total }] = await sequelize.query(
    `SELECT COUNT(*) AS total FROM users u WHERE ${where}`,
    { replacements, type: QueryTypes.SELECT }
  );

  const totalRecord = parseInt(total);
  const totalPage = Math.ceil(totalRecord / limitItems) || 1;
  if (page > totalPage) page = totalPage;
  const skip = (page - 1) * limitItems;

  replacements.limit = limitItems;
  replacements.offset = skip;

  const userList = await sequelize.query(
    `SELECT u.id, u.full_name, u.email, u.avatar_url, u.status, u.created_at,
       COUNT(DISTINCT d.id) AS deck_count
     FROM users u
     LEFT JOIN decks d ON d.owner_id = u.id AND d.status != 'deleted'
     WHERE ${where}
     GROUP BY u.id
     ORDER BY u.created_at DESC
     LIMIT :limit OFFSET :offset`,
    { replacements, type: QueryTypes.SELECT }
  );

  res.render('admin/pages/user-list', {
    pageTitle: 'Quản lý người dùng',
    userList,
    pagination: { skip, totalRecord, totalPage, currentPage: page }
  });
};

module.exports.detail = async (req, res) => {
  try {
    const [userDetail] = await sequelize.query(
      `SELECT u.id, u.full_name, u.email, u.avatar_url, u.status, u.created_at,
         COUNT(DISTINCT d.id) AS deck_count
       FROM users u
       LEFT JOIN decks d ON d.owner_id = u.id AND d.status != 'deleted'
       WHERE u.id = :id AND u.role = 'user'
       GROUP BY u.id`,
      { replacements: { id: req.params.id }, type: QueryTypes.SELECT }
    );

    if (!userDetail) return res.redirect('/admin/user/list');

    const deckList = await sequelize.query(
      `SELECT d.id, d.title, d.status,
         c.name AS category_name,
         COUNT(DISTINCT ca.id) AS card_count
       FROM decks d
       LEFT JOIN categories c ON c.id = d.category_id
       LEFT JOIN cards ca ON ca.deck_id = d.id AND ca.status = 'active'
       WHERE d.owner_id = :ownerId AND d.visibility = 'public' AND d.status != 'deleted'
       GROUP BY d.id, c.name
       ORDER BY d.created_at DESC`,
      { replacements: { ownerId: req.params.id }, type: QueryTypes.SELECT }
    );

    // Reshape để pug dùng deck.category.name
    const deckListMapped = deckList.map(d => ({
      ...d,
      category: { name: d.category_name },
      card_count: parseInt(d.card_count)
    }));

    res.render('admin/pages/user-detail', {
      pageTitle: `Chi tiết người dùng: ${userDetail.full_name}`,
      userDetail: { ...userDetail, deck_count: parseInt(userDetail.deck_count) },
      deckList: deckListMapped
    });
  } catch (error) {
    res.redirect('/admin/user/list');
  }
};

module.exports.changeStatusPatch = async (req, res) => {
  try {
    const user = await User.findOne({ where: { id: req.params.id, role: 'user' } });
    if (!user) return res.json({ code: 'error' });

    const newStatus = user.status === 'active' ? 'locked' : 'active';
    await User.update(
      { status: newStatus, updated_at: new Date() },
      { where: { id: req.params.id } }
    );

    res.json({ code: 'success' });
  } catch (error) {
    res.json({ code: 'error' });
  }
};
