const { Op, QueryTypes } = require('sequelize');
const sequelize    = require('../../config/database');
const Deck         = require('../../models/deck.model');
const SavedDeck    = require('../../models/savedDeck.model');
const CardProgress = require('../../models/cardProgress.model');
const ReviewLog    = require('../../models/reviewLog.model');

const TODAY = () => new Date().toISOString().slice(0, 10);

// Lấy danh sách thẻ cần ôn hôm nay (thẻ mới chưa có progress + thẻ đến hạn)
async function getDueCards(userId, deckIds) {
  const today = TODAY();

  // JOIN card_progress để lọc thẻ đến hạn ngay trong SQL
  const rows = await sequelize.query(`
    SELECT c.*,
           cp.id AS sp_id, cp.due_date, cp.repetitions, cp.interval_days,
           cp.ease_factor, cp.lapse_count, cp.is_difficult, cp.last_reviewed_at
    FROM cards c
    LEFT JOIN card_progress cp ON cp.card_id = c.id AND cp.user_id = :userId
    WHERE c.deck_id IN (:deckIds) AND c.status = 'active'
      AND (cp.id IS NULL OR cp.due_date <= :today)
    ORDER BY c.position ASC, c.created_at ASC
  `, { replacements: { userId, deckIds, today }, type: QueryTypes.SELECT });

  // Reshape: tách riêng studyProgress để view dùng card.studyProgress
  return rows.map(c => ({
    ...c,
    studyProgress: c.sp_id !== null ? {
      id: c.sp_id, due_date: c.due_date, repetitions: c.repetitions,
      interval_days: c.interval_days, ease_factor: c.ease_factor,
      lapse_count: c.lapse_count, is_difficult: c.is_difficult,
      last_reviewed_at: c.last_reviewed_at
    } : null
  }));
}

// Ôn tập một bộ thẻ cụ thể (tất cả thẻ, bao gồm thẻ chưa đến hạn)
module.exports.study = async (req, res) => {
  try {
    const userId = parseInt(req.user.id);
    const deckId = parseInt(req.params.id);

    const deck = await Deck.findOne({
      where: { id: deckId, status: { [Op.ne]: 'deleted' } },
      raw: true
    });
    if (!deck) return res.redirect('/deck');

    // Kiểm tra quyền truy cập: phải là owner hoặc đã lưu deck
    const isOwner = parseInt(deck.owner_id) === userId;
    if (!isOwner) {
      const saved = await SavedDeck.findOne({
        where: { user_id: userId, deck_id: deckId, status: 'active' }
      });
      if (!saved) return res.redirect('/deck');
    }

    // Lấy tất cả thẻ kèm tiến độ học của user bằng JOIN
    const rows = await sequelize.query(`
      SELECT c.*,
             cp.id AS sp_id, cp.due_date, cp.repetitions, cp.interval_days,
             cp.ease_factor, cp.lapse_count, cp.is_difficult, cp.last_reviewed_at
      FROM cards c
      LEFT JOIN card_progress cp ON cp.card_id = c.id AND cp.user_id = :userId
      WHERE c.deck_id = :deckId AND c.status = 'active'
      ORDER BY c.position ASC, c.created_at ASC
    `, { replacements: { userId, deckId }, type: QueryTypes.SELECT });

    const cards = rows.map(c => ({
      ...c,
      studyProgress: c.sp_id !== null ? {
        id: c.sp_id, due_date: c.due_date, repetitions: c.repetitions,
        interval_days: c.interval_days, ease_factor: c.ease_factor,
        lapse_count: c.lapse_count, is_difficult: c.is_difficult,
        last_reviewed_at: c.last_reviewed_at
      } : null
    }));

    res.render('client/pages/study', {
      title: `${deck.title} — FlashLearn`,
      currentPage: 'deck',
      deck,
      cards
    });
  } catch (error) {
    res.redirect('/deck');
  }
};

// Ôn tập tất cả thẻ đến hạn hôm nay trong toàn bộ deck của user
module.exports.studyDue = async (req, res) => {
  try {
    const userId = parseInt(req.user.id);

    // Gom tất cả deck user có quyền (tự tạo + đã lưu)
    const ownedDecks = await Deck.findAll({
      where: { owner_id: userId, status: { [Op.ne]: 'deleted' } },
      attributes: ['id'],
      raw: true
    });
    const savedRows = await SavedDeck.findAll({
      where: { user_id: userId, status: 'active' },
      attributes: ['deck_id'],
      raw: true
    });

    const deckIds = [
      ...ownedDecks.map(d => parseInt(d.id)),
      ...savedRows.map(r => parseInt(r.deck_id))
    ];

    const cards = deckIds.length ? await getDueCards(userId, deckIds) : [];

    res.render('client/pages/study', {
      title: 'Ôn tập thẻ đến hạn — FlashLearn',
      currentPage: 'deck',
      deck: { id: 0, title: 'Thẻ đến hạn hôm nay' },
      cards
    });
  } catch (error) {
    res.redirect('/dashboard');
  }
};

// Ghi nhận kết quả ôn tập một thẻ, tính lịch ôn tiếp theo theo thuật toán SM-2
module.exports.rate = async (req, res) => {
  try {
    const userId = parseInt(req.user.id);
    const { card_id, rating } = req.body;

    if (!['good', 'easy'].includes(rating)) {
      return res.json({ code: 'error' });
    }

    const card = await Card.findOne({ where: { id: card_id, status: 'active' } });
    if (!card) return res.json({ code: 'error' });

    // Tạo progress nếu chưa có (lần đầu học thẻ này)
    const [sp] = await CardProgress.findOrCreate({
      where: { user_id: userId, card_id: parseInt(card_id) },
      defaults: {
        repetitions: 0, interval_days: 0, ease_factor: 2.50,
        due_date: TODAY(), lapse_count: 0, is_difficult: false,
        created_at: new Date(), updated_at: new Date()
      }
    });

    const prevInterval = sp.interval_days;
    const prevEase     = parseFloat(sp.ease_factor);
    const prevDue      = sp.due_date;
    const reps         = sp.repetitions;

    // Tính interval mới theo SM-2: good giữ ease, easy tăng ease và interval
    let newInterval, newEase;
    if (rating === 'good') {
      if (reps === 0)      newInterval = 1;
      else if (reps === 1) newInterval = 6;
      else                 newInterval = Math.round(prevInterval * prevEase);
      newEase = prevEase;
    } else {
      newInterval = Math.round(Math.max(prevInterval, 1) * 2);
      newEase     = Math.min(3.5, prevEase + 0.15);
    }

    const nextDue = new Date();
    nextDue.setDate(nextDue.getDate() + newInterval);
    const nextDueStr = nextDue.toISOString().slice(0, 10);

    // Cập nhật tiến độ học
    await sp.update({
      repetitions:      reps + 1,
      interval_days:    newInterval,
      ease_factor:      newEase,
      due_date:         nextDueStr,
      last_reviewed_at: new Date(),
      updated_at:       new Date()
    });

    // Ghi log lịch sử ôn tập
    await ReviewLog.create({
      study_progress_id:      sp.id,
      rating,
      reviewed_at:            new Date(),
      previous_interval_days: prevInterval,
      new_interval_days:      newInterval,
      previous_due_date:      prevDue,
      next_due_date:          nextDueStr,
      previous_ease_factor:   prevEase,
      new_ease_factor:        newEase
    });

    res.json({ code: 'success' });
  } catch (error) {
    res.json({ code: 'error' });
  }
};
