const { Op } = require('sequelize');
const Deck         = require('../../models/deck.model');
const Card         = require('../../models/card.model');
const SavedDeck    = require('../../models/savedDeck.model');
const CardProgress = require('../../models/cardProgress.model');
const ReviewLog    = require('../../models/reviewLog.model');

const TODAY = () => new Date().toISOString().slice(0, 10);

async function getDueCards(userId, deckIds) {
  const allCards = await Card.findAll({
    where: { deck_id: { [Op.in]: deckIds }, status: 'active' },
    order: [['position', 'ASC'], ['created_at', 'ASC']],
    raw: true
  });
  if (!allCards.length) return [];

  const cardIds = allCards.map(c => parseInt(c.id));
  const progressRows = await CardProgress.findAll({
    where: { user_id: userId, card_id: { [Op.in]: cardIds } },
    raw: true
  });
  const progressMap = Object.fromEntries(progressRows.map(p => [parseInt(p.card_id), p]));

  const today = TODAY();
  return allCards
    .filter(c => {
      const sp = progressMap[parseInt(c.id)];
      return !sp || sp.due_date <= today;
    })
    .map(c => ({ ...c, studyProgress: progressMap[parseInt(c.id)] || null }));
}

module.exports.study = async (req, res) => {
  try {
    const userId = parseInt(req.user.id);
    const deckId = parseInt(req.params.id);

    const deck = await Deck.findOne({
      where: { id: deckId, status: { [Op.ne]: 'deleted' } },
      raw: true
    });
    if (!deck) return res.redirect('/deck');

    const isOwner = parseInt(deck.owner_id) === userId;
    if (!isOwner) {
      const saved = await SavedDeck.findOne({
        where: { user_id: userId, deck_id: deckId, status: 'active' }
      });
      if (!saved) return res.redirect('/deck');
    }

    const allCards = await Card.findAll({
      where: { deck_id: deckId, status: 'active' },
      order: [['position', 'ASC'], ['created_at', 'ASC']],
      raw: true
    });
    const cardIds = allCards.map(c => parseInt(c.id));
    const progressRows = cardIds.length ? await CardProgress.findAll({
      where: { user_id: userId, card_id: { [Op.in]: cardIds } },
      raw: true
    }) : [];
    const progressMap = Object.fromEntries(progressRows.map(p => [parseInt(p.card_id), p]));
    const cards = allCards.map(c => ({ ...c, studyProgress: progressMap[parseInt(c.id)] || null }));

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

module.exports.studyDue = async (req, res) => {
  try {
    const userId = parseInt(req.user.id);

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

module.exports.rate = async (req, res) => {
  try {
    const userId = parseInt(req.user.id);
    const { card_id, rating } = req.body;

    if (!['good', 'easy'].includes(rating)) {
      return res.json({ code: 'error' });
    }

    const card = await Card.findOne({ where: { id: card_id, status: 'active' } });
    if (!card) return res.json({ code: 'error' });

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

    await sp.update({
      repetitions:      reps + 1,
      interval_days:    newInterval,
      ease_factor:      newEase,
      due_date:         nextDueStr,
      last_reviewed_at: new Date(),
      updated_at:       new Date()
    });

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
