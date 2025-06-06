document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('entry-form');
  const tableBody = document.querySelector('#entries-table tbody');

  function loadEntries() {
    fetch('/api/entries')
      .then(res => res.json())
      .then(entries => {
        tableBody.innerHTML = '';
        entries.forEach(e => {
          const tr = document.createElement('tr');
          tr.innerHTML = `<td>${e.date}</td><td>${e.meal}</td><td>${e.calories}</td>` +
            `<td><button data-id="${e.id}" class="delete">Löschen</button></td>`;
          tableBody.appendChild(tr);
        });
      });
  }

  form.addEventListener('submit', ev => {
    ev.preventDefault();
    const data = {
      date: form.date.value,
      meal: form.meal.value,
      calories: form.calories.value
    };
    fetch('/api/entries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(() => {
      form.reset();
      loadEntries();
    });
  });

  tableBody.addEventListener('click', ev => {
    if (ev.target.classList.contains('delete')) {
      const id = ev.target.getAttribute('data-id');
      fetch('/api/entries/' + id, { method: 'DELETE' })
        .then(loadEntries);
    }
  });

  loadEntries();
});
