(function () {
  const questions = JSON.parse(document.getElementById('questionsData').textContent);
  const deckId    = document.getElementById('deckId').value;
  const letters   = ['A', 'B', 'C', 'D'];

  let current  = 0;
  let answered = false;
  const answers = [];

  const elQuestionLabel = document.getElementById('questionLabel');
  const elQuestionText  = document.getElementById('questionText');
  const elChoicesWrap   = document.getElementById('choicesWrap');
  const elFeedback      = document.getElementById('quizFeedback');
  const elNextBtn       = document.getElementById('nextBtn');
  const elProgressLabel = document.getElementById('progressLabel');
  const elProgressPct   = document.getElementById('progressPct');
  const elProgressFill  = document.getElementById('progressFill');

  function updateProgress() {
    const pct = Math.round((current + 1) / questions.length * 100);
    elProgressLabel.textContent = 'Câu ' + (current + 1) + ' / ' + questions.length;
    elProgressPct.textContent   = pct + '%';
    elProgressFill.style.width  = pct + '%';
  }

  function loadQuestion() {
    const q = questions[current];
    elQuestionText.textContent = q.question_text;
    elFeedback.className = 'quiz-feedback';
    elNextBtn.classList.remove('show');
    answered = false;

    elChoicesWrap.innerHTML = '';
    q.answer_options.forEach(function (option, i) {
      const btn = document.createElement('button');
      btn.className = 'choice';
      btn.innerHTML =
        '<div class="choice-letter">' + letters[i] + '</div>' +
        '<span class="choice-text">' + option + '</span>' +
        '<span class="choice-icon"></span>';
      btn.addEventListener('click', function () { selectChoice(btn, option, q); });
      elChoicesWrap.appendChild(btn);
    });

    updateProgress();
  }

  function selectChoice(el, option, q) {
    if (answered) return;
    answered = true;

    const isCorrect = option === q.correct_answer;

    elChoicesWrap.querySelectorAll('.choice').forEach(function (btn) {
      btn.classList.add('disabled');
      const text = btn.querySelector('.choice-text').textContent;
      if (text === q.correct_answer) {
        btn.classList.add('correct');
        btn.querySelector('.choice-icon').textContent = '✓';
      }
    });

    if (isCorrect) {
      el.classList.add('correct');
      elFeedback.textContent  = '✅ Chính xác!';
      elFeedback.className    = 'quiz-feedback show correct';
    } else {
      el.classList.add('wrong');
      el.querySelector('.choice-icon').textContent = '✗';
      elFeedback.textContent = '❌ Chưa đúng! Đáp án đúng là "' + q.correct_answer + '".';
      elFeedback.className   = 'quiz-feedback show wrong';
    }

    answers.push({
      card_id:        q.card_id,
      question_text:  q.question_text,
      correct_answer: q.correct_answer,
      user_answer:    option,
      is_correct:     isCorrect
    });

    const isLast = current === questions.length - 1;
    elNextBtn.textContent = isLast ? 'Nộp bài' : 'Câu tiếp theo →';
    elNextBtn.classList.add('show');
  }

  function nextQuestion() {
    current++;
    if (current >= questions.length) {
      submit();
      return;
    }
    loadQuestion();
  }

  function submit() {
    elNextBtn.disabled = true;
    fetch('/deck/quiz/choice/' + deckId, {
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
  }

  elNextBtn.addEventListener('click', nextQuestion);
  loadQuestion();
})();
