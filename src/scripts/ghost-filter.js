const search = document.querySelector('#ghost-search');
const evidence = document.querySelector('#ghost-evidence');
const filter = document.querySelector('#ghost-filter');
const cards = Array.from(document.querySelectorAll('#ghost-grid .card'));
const count = document.querySelector('#ghost-count');
const empty = document.querySelector('#ghost-empty');

let timeoutId = 0;

function update() {
  const term = search ? search.value.trim().toLowerCase() : '';
  const chosen = evidence ? evidence.value : '';
  const mode = filter ? filter.value : '';
  let shown = 0;

  for (const card of cards) {
    const name = card.dataset.name || '';
    const ev = card.dataset.evidence || '';
    const tags = card.dataset.tags || '';
    const matches =
      (term === '' || name.includes(term)) &&
      (chosen === '' || ev.split(' ').includes(chosen)) &&
      (mode === '' || tags.split(' ').includes(mode));

    card.hidden = !matches;
    if (matches) shown += 1;
  }

  if (count) count.textContent = String(shown);
  if (empty) empty.hidden = shown !== 0;
}

function debounceUpdate() {
  clearTimeout(timeoutId);
  timeoutId = setTimeout(update, 300);
}

search?.addEventListener('input', debounceUpdate);
evidence?.addEventListener('change', update);
filter?.addEventListener('change', update);
