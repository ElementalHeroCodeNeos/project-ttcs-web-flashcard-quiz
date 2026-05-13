const Category = require('../../models/category.model');

module.exports.list = async (req, res) => {
  const where = {};
  if (req.query.status) where.status = req.query.status;

  const categoryList = await Category.findAll({
    where,
    order: [['position', 'ASC']]
  });

  res.render('admin/pages/category-list', {
    pageTitle: 'Quản lý danh mục',
    categoryList
  });
};

module.exports.create = (req, res) => {
  res.render('admin/pages/category-create', { pageTitle: 'Tạo danh mục' });
};

module.exports.createPost = async (req, res) => {
  try {
    const { name, description, status } = req.body;
    let position = parseInt(req.body.position);
    if (!position) position = await Category.count() + 1;

    await Category.create({
      name, description, position, status,
      created_at: new Date(),
      updated_at: new Date()
    });

    res.json({ code: 'success' });
  } catch (error) {
    res.json({ code: 'error' });
  }
};

module.exports.edit = async (req, res) => {
  try {
    const category = await Category.findOne({ where: { id: req.params.id } });
    if (!category) return res.redirect('/admin/category/list');

    res.render('admin/pages/category-edit', {
      pageTitle: 'Chỉnh sửa danh mục',
      category
    });
  } catch (error) {
    res.redirect('/admin/category/list');
  }
};

module.exports.editPatch = async (req, res) => {
  try {
    const { name, description, status } = req.body;
    let position = parseInt(req.body.position);
    if (!position) position = await Category.count() + 1;

    await Category.update(
      { name, description, position, status, updated_at: new Date() },
      { where: { id: req.params.id } }
    );

    res.json({ code: 'success' });
  } catch (error) {
    res.json({ code: 'error' });
  }
};

module.exports.changeStatusPatch = async (req, res) => {
  try {
    const category = await Category.findOne({ where: { id: req.params.id } });
    if (!category) return res.json({ code: 'error' });

    const newStatus = category.status === 'active' ? 'inactive' : 'active';
    await Category.update(
      { status: newStatus, updated_at: new Date() },
      { where: { id: req.params.id } }
    );

    res.json({ code: 'success' });
  } catch (error) {
    res.json({ code: 'error' });
  }
};
