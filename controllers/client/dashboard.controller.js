function generateStreakDays(streak) {
  const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
  const today = new Date();
  const days = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    days.push({
      date: d.getDate(),
      label: i === 0 ? 'Hôm nay' : dayNames[d.getDay()],
      status: i === 0 ? 'today' : i < streak ? 'done' : 'skip'
    });
  }
  return days;
}

function generateWeeklyLabels() {
  const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
  const today = new Date();
  const labels = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    labels.push(i === 0 ? 'Hôm nay' : dayNames[d.getDay()]);
  }
  return labels;
}

module.exports.index = (req, res) => {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'buổi sáng' : hour < 18 ? 'buổi chiều' : 'buổi tối';

  const streak = 0;
  const dueCount = 0;
  const totalStudied = 0;
  const deckCount = 0;
  const avgAccuracy = 0;
  const hardCardCount = 0;
  const todayStudied = 0;

  const weeklyData = {
    labels: generateWeeklyLabels(),
    data: [0, 0, 0, 0, 0, 0, 0]
  };
  const weeklyTotal = weeklyData.data.reduce((a, b) => a + b, 0);

  const deckAccuracy = [];
  const streakDays = generateStreakDays(streak);
  const recentDecks = [];

  res.render('client/pages/dashboard', {
    title: 'Trang chủ — FlashLearn',
    currentPage: 'dashboard',
    greeting,
    streak,
    dueCount,
    totalStudied,
    deckCount,
    avgAccuracy,
    hardCardCount,
    todayStudied,
    weeklyData,
    weeklyTotal,
    deckAccuracy,
    streakDays,
    recentDecks
  });
};
