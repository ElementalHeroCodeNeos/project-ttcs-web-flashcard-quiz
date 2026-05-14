const { Op } = require('sequelize');
const Card = require('../../models/card.model');
const Deck = require('../../models/deck.model');

// Thêm thẻ mới vào bộ thẻ (chỉ chủ sở hữu)
module.exports.createPost = async (req, res) => {
  try {
    const userId = parseInt(req.user.id);
    const deckId = parseInt(req.params.id);

    // Kiểm tra deck tồn tại và thuộc về user
    const deck = await Deck.findOne({
      where: { id: deckId, owner_id: userId, status: { [Op.ne]: 'deleted' } }
    });
    if (!deck) return res.json({ code: 'error', message: 'Không tìm thấy bộ thẻ!' });

    const { front, back } = req.body;

    // Position = số thẻ hiện tại + 1 để xếp cuối danh sách
    const count = await Card.count({ where: { deck_id: deckId, status: 'active' } });

    const card = await Card.create({
      deck_id:    deckId,
      front:      front.trim(),
      back:       back.trim(),
      position:   count + 1,
      created_at: new Date(),
      updated_at: new Date()
    });

    res.json({ code: 'success', card: { id: card.id, front: card.front, back: card.back } });
  } catch (error) {
    res.json({ code: 'error', message: 'Thêm thẻ thất bại!' });
  }
};

// Cập nhật nội dung mặt trước và mặt sau của thẻ (chỉ chủ sở hữu)
module.exports.editPatch = async (req, res) => {
  try {
    const userId = parseInt(req.user.id);
    const deckId = parseInt(req.params.id);

    const deck = await Deck.findOne({
      where: { id: deckId, owner_id: userId, status: { [Op.ne]: 'deleted' } }
    });
    if (!deck) return res.json({ code: 'error', message: 'Không tìm thấy bộ thẻ!' });

    const card = await Card.findOne({
      where: { id: req.params.cid, deck_id: deckId, status: 'active' }
    });
    if (!card) return res.json({ code: 'error', message: 'Không tìm thấy thẻ!' });

    const { front, back } = req.body;
    await card.update({ front: front.trim(), back: back.trim(), updated_at: new Date() });

    res.json({ code: 'success' });
  } catch (error) {
    res.json({ code: 'error', message: 'Cập nhật thẻ thất bại!' });
  }
};

// Xoá mềm thẻ (chỉ chủ sở hữu)
module.exports.deleteDelete = async (req, res) => {
  try {
    const userId = parseInt(req.user.id);
    const deckId = parseInt(req.params.id);

    const deck = await Deck.findOne({
      where: { id: deckId, owner_id: userId, status: { [Op.ne]: 'deleted' } }
    });
    if (!deck) return res.json({ code: 'error', message: 'Không tìm thấy bộ thẻ!' });

    const card = await Card.findOne({
      where: { id: req.params.cid, deck_id: deckId, status: 'active' }
    });
    if (!card) return res.json({ code: 'error', message: 'Không tìm thấy thẻ!' });

    await card.update({ status: 'deleted', deleted_at: new Date() });

    res.json({ code: 'success' });
  } catch (error) {
    res.json({ code: 'error', message: 'Xóa thẻ thất bại!' });
  }
};
