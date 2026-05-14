const { Op, QueryTypes } = require('sequelize');
const sequelize    = require('../../config/database');
const Deck         = require('../../models/deck.model');
const Card         = require('../../models/card.model');
const SavedDeck    = require('../../models/savedDeck.model');
const CardProgress = require('../../models/cardProgress.model');
const ReviewLog    = require('../../models/reviewLog.model');
const QuizSession  = require('../../models/quizSession.model');

const DAY_NAMES = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

// Trang dashboard chính của user: thống kê, biểu đồ, streak, deck gần nhất
module.exports.index = async (req, res) => {
  try {
    const userId = parseInt(req.user.id);
    const today  = new Date().toISOString().slice(0, 10);
    const hour   = new Date().getHours();
    const greeting = hour < 12 ? 'buổi sáng' : hour < 18 ? 'buổi chiều' : 'buổi tối';

    // ── Deck IDs user có quyền truy cập (tự tạo + đã lưu) ───────────
    const ownedDecks = await Deck.findAll({
      where: { owner_id: userId, status: { [Op.ne]: 'deleted' } },
      attributes: ['id', 'title', 'category_id'],
      order: [['updated_at', 'DESC']],
      raw: true
    });
    const savedRows = await SavedDeck.findAll({
      where: { user_id: userId, status: 'active' },
      attributes: ['deck_id'],
      raw: true
    });
    const savedDeckIds = savedRows.map(r => parseInt(r.deck_id));
    const deckCount    = ownedDecks.length + savedDeckIds.length;
    const allDeckIds   = [...ownedDecks.map(d => parseInt(d.id)), ...savedDeckIds];

    // ── Card IDs từ tất cả deck user có quyền ───────────────────────
    let allCardIds = [];
    if (allDeckIds.length) {
      const cardRows = await Card.findAll({
        where: { deck_id: { [Op.in]: allDeckIds }, status: 'active' },
        attributes: ['id'],
        raw: true
      });
      allCardIds = cardRows.map(c => parseInt(c.id));
    }

    // ── Progress IDs của user (dùng để query review_logs) ───────────
    const progressRows = await CardProgress.findAll({
      where: { user_id: userId },
      attributes: ['id'],
      raw: true
    });
    const progressIds = progressRows.map(r => parseInt(r.id));

    // ── Thống kê tổng quan ───────────────────────────────────────────

    // Số thẻ chưa học lần nào
    const progressedCount = allCardIds.length ? await CardProgress.count({
      where: { user_id: userId, card_id: { [Op.in]: allCardIds } }
    }) : 0;
    const newCardCount = allCardIds.length - progressedCount;

    // Số thẻ cần ôn hôm nay (đến hạn + thẻ mới)
    const dueProgressCount = allCardIds.length ? await CardProgress.count({
      where: { user_id: userId, card_id: { [Op.in]: allCardIds }, due_date: { [Op.lte]: today } }
    }) : 0;
    const dueCount = dueProgressCount + newCardCount;

    // Tổng số thẻ đã học ít nhất 1 lần
    const totalStudied = await CardProgress.count({
      where: { user_id: userId, repetitions: { [Op.gt]: 0 } }
    });

    // Số thẻ khó (user đánh dấu)
    const hardCardCount = await CardProgress.count({
      where: { user_id: userId, is_difficult: true }
    });

    // Độ chính xác trung bình từ các lần làm quiz
    let avgAccuracy = 0;
    const quizRows = await QuizSession.findAll({
      where: { user_id: userId, status: 'submitted', total_questions: { [Op.gt]: 0 } },
      attributes: ['correct_count', 'total_questions'],
      raw: true
    });
    if (quizRows.length) {
      const sumCorrect = quizRows.reduce((s, r) => s + parseInt(r.correct_count),   0);
      const sumTotal   = quizRows.reduce((s, r) => s + parseInt(r.total_questions), 0);
      avgAccuracy = Math.round(sumCorrect / sumTotal * 100);
    }

    // Số lần ôn tập hôm nay
    const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
    const todayStudied = progressIds.length ? await ReviewLog.count({
      where: { study_progress_id: { [Op.in]: progressIds }, reviewed_at: { [Op.gte]: todayStart } }
    }) : 0;

    // ── Biểu đồ ôn tập 7 ngày gần nhất ─────────────────────────────
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const reviewMap = {};
    if (progressIds.length) {
      const wRows = await ReviewLog.findAll({
        where: { study_progress_id: { [Op.in]: progressIds }, reviewed_at: { [Op.gte]: sevenDaysAgo } },
        attributes: [
          [sequelize.fn('DATE', sequelize.col('reviewed_at')), 'date'],
          [sequelize.fn('COUNT', sequelize.col('id')),         'count']
        ],
        group: [sequelize.fn('DATE', sequelize.col('reviewed_at'))],
        raw: true
      });
      wRows.forEach(r => { reviewMap[r.date] = parseInt(r.count); });
    }

    const labels = [], data = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const ds = d.toISOString().slice(0, 10);
      labels.push(i === 0 ? 'Hôm nay' : DAY_NAMES[d.getDay()]);
      data.push(reviewMap[ds] || 0);
    }
    const weeklyData  = { labels, data };
    const weeklyTotal = data.reduce((a, b) => a + b, 0);

    // ── Streak: số ngày ôn tập liên tiếp (tính trong 30 ngày gần nhất) ─
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29);
    thirtyDaysAgo.setHours(0, 0, 0, 0);

    const studiedDates = new Set();
    if (progressIds.length) {
      const sRows = await ReviewLog.findAll({
        where: { study_progress_id: { [Op.in]: progressIds }, reviewed_at: { [Op.gte]: thirtyDaysAgo } },
        attributes: [[sequelize.fn('DATE', sequelize.col('reviewed_at')), 'date']],
        group: [sequelize.fn('DATE', sequelize.col('reviewed_at'))],
        raw: true
      });
      sRows.forEach(r => studiedDates.add(r.date));
    }

    // Đếm streak từ hôm nay ngược về quá khứ
    let streak = 0;
    const checkDay = new Date();
    if (!studiedDates.has(today)) checkDay.setDate(checkDay.getDate() - 1);
    for (let i = 0; i < 30; i++) {
      const ds = checkDay.toISOString().slice(0, 10);
      if (!studiedDates.has(ds)) break;
      streak++;
      checkDay.setDate(checkDay.getDate() - 1);
    }

    // Build mảng 14 ngày gần nhất để hiển thị lịch streak
    const streakDays = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const ds = d.toISOString().slice(0, 10);
      streakDays.push({
        date:   d.getDate(),
        label:  i === 0 ? 'Hôm nay' : DAY_NAMES[d.getDay()],
        status: i === 0 ? 'today' : studiedDates.has(ds) ? 'done' : 'skip'
      });
    }

    // ── 4 bộ thẻ truy cập gần nhất, kèm tiến độ học ─────────────────
    const recentDeckRows = allDeckIds.length ? await sequelize.query(`
      SELECT d.*, c.name AS category_name
      FROM decks d
      JOIN categories c ON c.id = d.category_id
      WHERE d.id IN (:allDeckIds) AND d.status != 'deleted'
      ORDER BY d.updated_at DESC
      LIMIT 4
    `, { replacements: { allDeckIds }, type: QueryTypes.SELECT }) : [];

    let recentDecks = [];
    if (recentDeckRows.length) {
      const recentDeckIds = recentDeckRows.map(d => parseInt(d.id));

      // Lấy tất cả thẻ của 4 deck, nhóm theo deck_id
      const recentCardRows = await Card.findAll({
        where: { deck_id: { [Op.in]: recentDeckIds }, status: 'active' },
        attributes: ['id', 'deck_id'],
        raw: true
      });
      const cardsByDeck = {};
      recentCardRows.forEach(c => {
        const did = parseInt(c.deck_id);
        if (!cardsByDeck[did]) cardsByDeck[did] = [];
        cardsByDeck[did].push(parseInt(c.id));
      });

      const recentCardIds = recentCardRows.map(c => parseInt(c.id));

      // Thẻ đến hạn ôn hôm nay
      const dueRows = recentCardIds.length ? await CardProgress.findAll({
        where: { user_id: userId, card_id: { [Op.in]: recentCardIds }, due_date: { [Op.lte]: today } },
        attributes: ['card_id'],
        raw: true
      }) : [];
      const dueSet = new Set(dueRows.map(r => parseInt(r.card_id)));

      // Thẻ đã học ít nhất 1 lần (tính % tiến độ)
      const learnedRows = recentCardIds.length ? await CardProgress.findAll({
        where: { user_id: userId, card_id: { [Op.in]: recentCardIds }, repetitions: { [Op.gt]: 0 } },
        attributes: ['card_id'],
        raw: true
      }) : [];
      const learnedSet = new Set(learnedRows.map(r => parseInt(r.card_id)));

      recentDecks = recentDeckRows.map(deck => {
        const deckCardIds = cardsByDeck[parseInt(deck.id)] || [];
        const totalCards  = deckCardIds.length;
        const dueToday    = deckCardIds.filter(id => dueSet.has(id)).length;
        const learned     = deckCardIds.filter(id => learnedSet.has(id)).length;
        const progress    = totalCards > 0 ? Math.round(learned / totalCards * 100) : 0;
        return {
          ...deck,
          totalCards, dueToday, progress,
          category: { name: deck.category_name || '' }
        };
      });
    }

    res.render('client/pages/dashboard', {
      title: 'Trang chủ — FlashLearn',
      currentPage: 'dashboard',
      greeting, dueCount, totalStudied, deckCount,
      avgAccuracy, hardCardCount, todayStudied,
      weeklyData, weeklyTotal, streak, streakDays, recentDecks
    });
  } catch (error) {
    res.redirect('/');
  }
};
