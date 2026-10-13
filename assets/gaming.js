/* The catalogue works without JavaScript; filters only narrow existing cards. */
(() => {
  'use strict';
  const buttons = [...document.querySelectorAll('[data-filter]')];
  const cards = [...document.querySelectorAll('.gaming-card[data-tier]')];
  const budget = document.querySelector('[data-empty-budget]');
  buttons.forEach(button => button.addEventListener('click', () => {
    const selected = button.dataset.filter;
    buttons.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    cards.forEach(card => { card.hidden = selected !== 'all' && card.dataset.tier !== selected; });
    if (budget) budget.hidden = selected !== 'all' && selected !== 'budget';
  }));
})();
