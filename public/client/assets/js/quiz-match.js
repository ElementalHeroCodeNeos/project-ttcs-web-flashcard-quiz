(function () {
  const cards  = JSON.parse(document.getElementById('cardsData').textContent);
  const deckId = document.getElementById('deckId').value;

  const elLeftCol   = document.getElementById('leftCol');
  const elRightCol  = document.getElementById('rightCol');
  const elPairsLeft = document.getElementById('pairsLeft');
  const elSubmitBtn = document.getElementById('submitBtn');

  let selectedLeft   = null;
  const leftPairs    = {};   // leftId  → rightId
  const rightPairs   = {};   // rightId → leftId
  const pairColorMap = {};   // leftId  → colorIdx (1-8)
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
    el.dataset.id  = String(id);
    el.textContent = text;
    el.addEventListener('click', function () {
      if (side === 'left') handleLeft(el);
      else                 handleRight(el);
    });
    return el;
  }

  shuffle(cards).forEach(function (c) {
    elLeftCol.appendChild(makeItem(c.card_id, c.front, 'left'));
  });
  shuffle(cards).forEach(function (c) {
    elRightCol.appendChild(makeItem(c.card_id, c.back, 'right'));
  });

  function handleLeft(el) {
    if (el.classList.contains('active-left')) {
      el.classList.remove('active-left');
      selectedLeft = null;
      return;
    }
    elLeftCol.querySelectorAll('.active-left').forEach(function (e) {
      e.classList.remove('active-left');
    });
    selectedLeft = el;
    el.classList.add('active-left');
  }

  function unpairLeft(leftId) {
    const rightId  = leftPairs[leftId];
    const colorIdx = pairColorMap[leftId];
    if (!rightId) return;

    const lEl = elLeftCol.querySelector('[data-id="' + leftId + '"]');
    const rEl = elRightCol.querySelector('[data-id="' + rightId + '"]');
    if (lEl) lEl.classList.remove('paired', 'pair-' + colorIdx);
    if (rEl) rEl.classList.remove('paired', 'pair-' + colorIdx);

    colorPool.unshift(colorIdx);
    delete leftPairs[leftId];
    delete rightPairs[rightId];
    delete pairColorMap[leftId];
  }

  function handleRight(el) {
    if (!selectedLeft) return;

    const leftId  = selectedLeft.dataset.id;
    const rightId = el.dataset.id;

    // Un-pair the current left if already paired
    unpairLeft(leftId);

    // Un-pair whichever left currently holds this right
    if (rightPairs[rightId]) {
      unpairLeft(rightPairs[rightId]);
    }

    // Assign pair with next available color
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

    if (pairedCount === cards.length) {
      elSubmitBtn.classList.add('show');
    } else {
      elSubmitBtn.classList.remove('show');
    }
  }

  elSubmitBtn.addEventListener('click', function () {
    elSubmitBtn.disabled = true;

    const answers = cards.map(function (c) {
      const rightId    = leftPairs[String(c.card_id)];
      const pairedCard = cards.find(function (x) { return String(x.card_id) === rightId; });
      return {
        card_id:        c.card_id,
        question_text:  c.front,
        correct_answer: c.back,
        user_answer:    pairedCard ? pairedCard.back : null,
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
