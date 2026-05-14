(function () {
  const cards  = JSON.parse(document.getElementById('cardsData').textContent);
  const deckId = document.getElementById('deckId').value;

  const elLeftCol   = document.getElementById('leftCol');
  const elRightCol  = document.getElementById('rightCol');
  const elPairsLeft = document.getElementById('pairsLeft');
  const elSubmitBtn = document.getElementById('submitBtn');

  let selectedLeft   = null;
  // Map 2 chiều để unlink nhanh O(1) khi user thay đổi ghép cặp
  const leftPairs    = {};   // leftId  → rightId
  const rightPairs   = {};   // rightId → leftId
  const pairColorMap = {};   // leftId  → colorIdx (1-8), để xóa đúng class khi unpair
  // Màu được "mượn" (shift) khi ghép và "trả lại" (unshift) khi hủy ghép
  const colorPool    = [1, 2, 3, 4, 5, 6, 7, 8];

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function makeItem(id, text, side) {
    const el = document.createElement('div');
    el.className   = 'match-item';
    // dataset.id luôn là string — cần dùng String() khi so sánh với card_id (number)
    el.dataset.id  = String(id);
    el.textContent = text;
    el.addEventListener('click', function () {
      if (side === 'left') handleLeft(el);
      else                 handleRight(el);
    });
    return el;
  }

  // shuffle gọi 2 lần riêng để cột trái và cột phải có thứ tự khác nhau
  shuffle(cards).forEach(function (c) {
    elLeftCol.appendChild(makeItem(c.card_id, c.front, 'left'));
  });
  shuffle(cards).forEach(function (c) {
    elRightCol.appendChild(makeItem(c.card_id, c.back, 'right'));
  });

  function handleLeft(el) {
    // Click lại ô đang được chọn → bỏ chọn
    if (el.classList.contains('active-left')) {
      el.classList.remove('active-left');
      selectedLeft = null;
      return;
    }
    // Bỏ chọn ô trái cũ nếu có trước khi chọn ô mới
    elLeftCol.querySelectorAll('.active-left').forEach(function (e) {
      e.classList.remove('active-left');
    });
    selectedLeft = el;
    el.classList.add('active-left');
  }

  // Hủy ghép một ô trái — trả màu về pool và xóa cả 2 entry trong leftPairs/rightPairs
  function unpairLeft(leftId) {
    const rightId  = leftPairs[leftId];
    const colorIdx = pairColorMap[leftId];
    if (!rightId) return;

    const lEl = elLeftCol.querySelector('[data-id="' + leftId + '"]');
    const rEl = elRightCol.querySelector('[data-id="' + rightId + '"]');
    if (lEl) lEl.classList.remove('paired', 'pair-' + colorIdx);
    if (rEl) rEl.classList.remove('paired', 'pair-' + colorIdx);

    // Trả màu lại đầu pool để ưu tiên dùng lại màu vừa giải phóng
    colorPool.unshift(colorIdx);
    delete leftPairs[leftId];
    delete rightPairs[rightId];
    delete pairColorMap[leftId];
  }

  function handleRight(el) {
    if (!selectedLeft) return;

    const leftId  = selectedLeft.dataset.id;
    const rightId = el.dataset.id;

    // Trường hợp 1: ô trái đang chọn đã có cặp → hủy cặp cũ trước
    unpairLeft(leftId);

    // Trường hợp 2: ô phải đích đã được ghép với ô trái khác → hủy cặp đó trước
    if (rightPairs[rightId]) {
      unpairLeft(rightPairs[rightId]);
    }

    const colorIdx = colorPool.shift();
    leftPairs[leftId]    = rightId;
    rightPairs[rightId]  = leftId;
    pairColorMap[leftId] = colorIdx;

    selectedLeft.classList.remove('active-left');
    selectedLeft.classList.add('paired', 'pair-' + colorIdx);
    el.classList.add('paired', 'pair-' + colorIdx);
    selectedLeft = null;

    const pairedCount = Object.keys(leftPairs).length;
    elPairsLeft.textContent = cards.length - pairedCount;

    // Nút Nộp bài chỉ hiện khi tất cả thẻ đã được ghép
    if (pairedCount === cards.length) {
      elSubmitBtn.classList.add('show');
    } else {
      elSubmitBtn.classList.remove('show');
    }
  }

  elSubmitBtn.addEventListener('click', function () {
    // Disable ngay để tránh double-submit khi mạng chậm
    elSubmitBtn.disabled = true;

    // Duyệt toàn bộ cards gốc để build answers — đảm bảo thứ tự ổn định
    const answers = cards.map(function (c) {
      // String() bắt buộc vì leftPairs key là string (từ dataset.id)
      const rightId    = leftPairs[String(c.card_id)];
      const pairedCard = cards.find(function (x) { return String(x.card_id) === rightId; });
      return {
        card_id:        c.card_id,
        question_text:  c.front,
        correct_answer: c.back,
        user_answer:    pairedCard ? pairedCard.back : null,
        // Đúng khi leftId ghép với rightId trùng card_id (ghép đúng cặp mặt trước ↔ mặt sau)
        is_correct:     rightId === String(c.card_id)
      };
    });

    fetch('/deck/quiz/match/' + deckId, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ answers: answers })
    })
      .then(function (res) { return res.json(); })
      .then(function (data) {
        if (data.attemptId) {
          window.location.href = '/deck/quiz/result/' + data.attemptId;
        }
      });
  });
})();
