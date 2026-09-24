/* ============================================================
   Screen: question
   ============================================================ */

export function renderQuestion(state) {
  const q = state.QUESTIONS[state.qIndex];
  const opts = q.options || state.OPTIONS;
  const selected = state.answers[state.qIndex];
  return `
    <div class="fade-in">
      <div class="question-text">${q.text}</div>
      ${q.hint ? `<div class="question-hint">${q.hint}</div>` : ''}
      <div class="options">
        ${opts.map((opt, i) => `
          <button class="option ${selected === i ? 'selected' : ''}" onclick="selectAnswer(${i})">
            <span>${opt}</span><span class="check-icon"><i data-lucide="check" width="21" height="21"></i></span>
          </button>
        `).join('')}
      </div>
    </div>
  `;
}
