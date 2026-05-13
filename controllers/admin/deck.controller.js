const { QueryTypes } = require('sequelize');
const sequelize = require('../../config/database');
const Deck = require('../../models/deck.model');
const Category = require('../../models/category.model');

module.exports.list = async (req, res) => {
  const limitItems = 10;
  let page = parseInt(req.query.page) || 1;

  const conditions = ["d.visibility = 'public'", "d.status != 'deleted'"];
  const replacements = {};

  if (req.query.category_id) {
    conditions.push('d.category_id = :categoryId');
    replacements.categoryId = req.query.category_id;
  }

  if (req.query.keyword) {
    conditions.push('d.title ILIKE :keyword');
    replacements.keyword = `%${req.query.keyword}%`;
  }

  const where = conditions.join(' AND ');

  const [{ total }] = await sequelize.query(
    `SELECT COUNT(*) AS total FROM decks d WHERE ${where}`,
    { replacements, type: QueryTypes.SELECT }
  );

  const totalRecord = parseInt(total);
  const totalPage = Math.ceil(totalRecord / limitItems) || 1;
  if (page > totalPage) page = totalPage;
  const skip = (page - 1) * limitItems;

  replacements.limit = limitItems;
  replacements.offset = skip;

  const deckList = await sequelize.query(
    `SELECT d.id, d.title, d.status,
       c.name AS category_name,
       u.full_name AS owner_name,
       COUNT(DISTINCT ca.id) AS card_count,
       COUNT(DISTINCT sd.id) AS save_count
     FROM decks d
     LEFT JOIN categories c ON c.id = d.category_id
     LEFT JOIN users u ON u.id = d.owner_id
     LEFT JOIN cards ca ON ca.deck_id = d.id AND ca.status = 'active'
     LEFT JOIN saved_decks sd ON sd.deck_id = d.id AND sd.status = 'active'
     WHERE ${where}
     GROUP BY d.id, c.name, u.full_name
     ORDER BY d.created_at DESC
     LIMIT :limit OFFSET :offset`,
    { replacements, type: QueryTypes.SELECT }
  );

  const categoryList = await Category.findAll({
    where: { status: 'active' },
    order: [['position', 'ASC']]
  });

  // Reshape để pug dùng item.category.name và item.owner.full_name
  const deckListMapped = deckList.map(d => ({
    ...d,
    category: { name: d.category_name },
    owner: { full_name: d.owner_name },
    card_count: parseInt(d.card_count),
    save_count: parseInt(d.save_count)
  }));

  res.render('admin/pages/deck-list', {
    pageTitle: 'Quản lý bộ thẻ công khai',
    deckList: deckListMapped,
    categoryList,
    pagination: { skip, totalRecord, totalPage, currentPage: page }
  });
};

module.exports.changeStatusPatch = async (req, res) => {
  try {
    const deck = await Deck.findOne({ where: { id: req.params.id, visibility: 'public' } });
    if (!deck) return res.json({ code: 'error' });

    const newStatus = deck.status === 'active' ? 'hidden' : 'active';
    await Deck.update(
      { status: newStatus, updated_at: new Date() },
      { where: { id: req.params.id } }
    );

    res.json({ code: 'success' });
  } catch (error) {
    res.json({ code: 'error' });
  }
};
