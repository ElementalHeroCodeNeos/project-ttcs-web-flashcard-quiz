(function () {
  // Dữ liệu thẻ được nhúng từ server vào thẻ <script id="cardsData"> trong Pug
  const cards = JSON.parse(document.getElementById('cardsData').textContent);
  // queue là bản sao làm việc — slice() để không mutate mảng gốc
  let queue = cards.slice();
  const total = cards.length;
  let done = 0;           // chỉ đếm thẻ đã thoát khỏi queue (Good/Easy), không đếm Again/Hard
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
    // Khóa nút Tiếp theo cho đến khi user chọn rating
    elNextBtn.disabled = true;
    elRatingWrap.classList.remove('show');
    elRatingBtns.classList.remove('rated');
    document.querySelectorAll('.btn-rating').forEach(function (b) { b.classList.remove('selected'); });
    elHint.style.display = 'block';

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
    // Hiện các nút rating chỉ sau khi đã lật — tránh user đánh giá khi chưa thấy mặt sau
    elRatingWrap.classList.add('show');
    elHint.style.display = 'none';
  }

  function rate(rating) {
    // Guard: chỉ cho phép đánh giá một lần sau khi đã lật thẻ
    if (!flipped || currentRating) return;
    currentRating = rating;
    elRatingBtns.classList.add('rated');
    document.querySelector('.btn-rating[data-rating="' + rating + '"]').classList.add('selected');
    elNextBtn.disabled = false;
  }

  // Thuật toán SM-2 biến thể — cập nhật trực tiếp vào card.studyProgress
  // để các lần Again/Hard liên tiếp tích lũy đúng (interval/ease thay đổi theo từng lần)
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
      // is_difficult không lưu riêng mà tính lại mỗi lần từ lapse_count
      is_difficult:  lapses >= 3
    };
  }

  function next() {
    if (!flipped) { flip(); return; }
    if (!currentRating) return;

    const card = queue.shift();
    applySM2(card, currentRating);

    if (currentRating === 'again' || currentRating === 'hard') {
      // Again/Hard: đẩy thẻ xuống cuối queue, xử lý in-memory, không gọi API
      // SM-2 đã được cập nhật trong card.studyProgress để lần sau tính đúng
      queue.push(card);
    } else {
      // Good/Easy: thẻ thoát khỏi queue, lưu tiến độ lên server (fire-and-forget)
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
  // Click vào bất kỳ chỗ nào trên thẻ cũng lật được (UX tiện hơn)
  elWrap.addEventListener('click', flip);
  elNextBtn.addEventListener('click', next);

  document.querySelectorAll('.btn-rating').forEach(function (btn) {
    btn.addEventListener('click', function () { rate(btn.dataset.rating); });
  });

  loadCard();
})();
