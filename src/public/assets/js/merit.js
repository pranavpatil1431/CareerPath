// merit.js — fetch and render merit list
document.addEventListener('DOMContentLoaded', () => {
  const tbody = document.querySelector('#meritTable tbody');
  async function load() {
    try {
      const res = await fetch('http://localhost:5000/merit');
      const rows = await res.json();
      tbody.innerHTML = '';
      rows.forEach((r, i) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td>${i+1}</td><td>${r.name}</td><td>${r.marks}</td><td>${r.stream}</td><td>${r.course}</td>`;
        tbody.appendChild(tr);
      });
    } catch (err) {
      tbody.innerHTML = '<tr><td colspan="5">Could not load merit list. Is the backend running?</td></tr>';
    }
  }
  load();
  // optional: refresh every 15 seconds
  setInterval(load, 15000);
});
