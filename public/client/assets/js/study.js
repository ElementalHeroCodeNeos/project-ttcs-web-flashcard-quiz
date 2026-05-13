(function () {
  const cards = JSON.parse(document.getElementById('cardsData').textContent);
  let queue = cards.slice();
  const total = cards.length;
  let done = 0;
  let flipped = false;
  let currentRating = null;

  const elFront      = document.getElementById('frontContent');
  const elBack       = document.getElementById('backContent');
  const elCardFront = document.getElementById('cardFront');
  const elCardBack  = document.getElementById('cardBack');
  const elSideLabel  = document.getElementById('sideLabel');
  const elFlipBtn    = document.getElementById('flipBtn');
  const elNextBtn    = document.getElementById('nextBtn');
  const elRatingWrap = document.getElementById('ratingWrap');
  const elRatingBtns = document.getElementById('ratingButtons');
  const elHint       = document.getElementById('studyHint');
  const elDone       = document.getElementById('studyDone');
  const elWrap       = document.getElementById('flashcardWrap');
  const elProgressLabel = document.getElementById('progressLabel');
  const elProgressPct   = document.getElementById('progressPct');
  const elProgressFill  = document.getElementById('progressFill');
  const elBtnRow        = document.querySelector('.study-btn-row');
  const elIntervalHard  = document.getElementById('intervalHard');
  const elIntervalGood  = document.getElementById('intervalGood');
  const elIntervalEasy  = document.getElementById('intervalEasy');

  function formatInterval(days) {
    if (!days || days <= 0) return '< 1 phút';
    if (days === 1) return '1 ngày';
    return days + ' ngày';
  }

  function updateIntervals(card) {
    const sp = card.studyProgress || {};
    const intervalDays = sp.interval_days || 0;
    const easeFactor   = sp.ease_factor   || 2.5;
    const repetitions  = sp.repetitions   || 0;

    elIntervalHard.textContent = formatInterval(Math.round(intervalDays * 1.2) || 1);

    let goodDays;
    if (repetitions === 0) goodDays = 1;
    else if (repetitions === 1) goodDays = 6;
    else goodDays = Math.round(intervalDays * easeFactor);
    elIntervalGood.textContent = formatInterval(goodDays);

    const easyDays = Math.round(Math.max(intervalDays, 1) * 2);
    elIntervalEasy.textContent = formatInterval(easyDays);
  }

  function loadCard() {
    if (queue.length === 0) {
      updateProgress();
      elWrap.style.display = 'none';
      elBtnRow.style.display = 'none';
      elRatingWrap.style.display = 'none';
      elHint.style.display = 'none';
      elDone.style.display = 'block';
      return;
    }

    const card = queue[0];
    flipped = false;
    currentRating = null;

    elCardFront.textContent = card.front;
    elCardBack.textContent  = card.back;

    elFront.classList.remove('hide');
    elBack.classList.remove('show');
    elSideLabel.textContent = 'Mặt trước';
    elFlipBtn.classList.remove('hidden');
    elNextBtn.disabled = true;
    elRatingWrap.classList.remove('show');
    elRatingBtns.classList.remove('rated');
    document.querySelectorAll('.btn-rating').forEach(function (b) { b.classList.remove('selected'); });
    elHint.style.display = 'block';

    updateIntervals(card);
    updateProgress();
  }

  function updateProgress() {
    const pct = total > 0 ? Math.round(done / total * 100) : 0;
    elProgressLabel.textContent = 'Thẻ ' + done + ' / ' + total;
    elProgressPct.textContent   = pct + '%';
    elProgressFill.style.width  = pct + '%';
  }

  function flip() {
    if (flipped) return;
    flipped = true;
    elFront.classList.add('hide');
    elBack.classList.add('show');
    elSideLabel.textContent = 'Mặt sau';
    elFlipBtn.classList.add('hidden');
    elRatingWrap.classList.add('show');
    elHint.style.display = 'none';
  }

  function rate(rating) {
    if (!flipped || currentRating) return;
    currentRating = rating;
    elRatingBtns.classList.add('rated');
    document.querySelector('.btn-rating[data-rating="' + rating + '"]').classList.add('selected');
    elNextBtn.disabled = false;
  }

  function applySM2(card, rating) {
    let sp = card.studyProgress || {};
    let interval   = sp.interval_days || 0;
    let ease       = sp.ease_factor   || 2.5;
    let reps       = sp.repetitions   || 0;
    let lapses     = sp.lapse_count   || 0;

    if (rating === 'again') {
      interval = 1;
      reps     = 0;
      lapses  += 1;
    } else if (rating === 'hard') {
      interval = Math.round(interval * 1.2) || 1;
      ease     = Math.max(1.3, ease - 0.15);
    } else if (rating === 'good') {
      if (reps === 0)      interval = 1;
      else if (reps === 1) interval = 6;
      else                 interval = Math.round(interval * ease);
      reps += 1;
    } else if (rating === 'easy') {
      interval = Math.round(Math.max(interval, 1) * 2);
      ease     = Math.min(3.5, ease + 0.15);
      reps    += 1;
    }

    card.studyProgress = {
      interval_days: interval,
      ease_factor:   ease,
      repetitions:   reps,
      lapse_count:   lapses,
      is_difficult:  lapses >= 3
    };
  }

  function next() {
    if (!flipped) { flip(); return; }
    if (!currentRating) return;

    const card = queue.shift();
    applySM2(card, currentRating);

    if (currentRating === 'again' || currentRating === 'hard') {
      queue.push(card);
    } else {
      done++;
      fetch('/study/rate', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ card_id: card.id, rating: currentRating })
      });
    }

    loadCard();
  }

  elFlipBtn.addEventListener('click', flip);
  elWrap.addEventListener('click', flip);
  elNextBtn.addEventListener('click', next);

  document.querySelectorAll('.btn-rating').forEach(function (btn) {
    btn.addEventListener('click', function () { rate(btn.dataset.rating); });
  });

  loadCard();
})();
