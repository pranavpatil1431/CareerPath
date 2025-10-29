// admin.js — simple admin login + view applicants
document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  const adminPanel = document.getElementById('adminPanel');
  const loginMessage = document.getElementById('loginMessage');
  let token = localStorage.getItem('adminToken') || null;

  async function fetchApplicants() {
    try {
      const res = await fetch('http://localhost:5000/admin/applicants', {
        headers: { 'x-admin-token': token }
      });
      if (res.status === 401) {
        loginMessage.style.color = 'red';
        loginMessage.innerText = 'Unauthorized. Please login.';
        return;
      }
      const rows = await res.json();
      const tbody = document.querySelector('#adminTable tbody');
      tbody.innerHTML = '';
      rows.forEach((r, i) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td>${i+1}</td><td>${r.name}</td><td>${r.marks}</td><td>${r.email}</td><td>${r.stream}</td><td>${r.course}</td><td>${r.applied_at}</td>`;
        tbody.appendChild(tr);
      });
    } catch (err) {
      loginMessage.style.color = 'red';
      loginMessage.innerText = 'Error fetching applicants.';
    }
  }

  if (token) {
    // try to load applicants
    adminPanel.style.display = 'block';
    loginForm.style.display = 'none';
    fetchApplicants();
  }

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('adminUser').value.trim();
    const password = document.getElementById('adminPass').value.trim();
    try {
      const res = await fetch('http://localhost:5000/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const json = await res.json();
      if (json.ok && json.token) {
        token = json.token;
        localStorage.setItem('adminToken', token);
        loginMessage.style.color = 'green';
        loginMessage.innerText = 'Login successful.';
        adminPanel.style.display = 'block';
        loginForm.style.display = 'none';
        fetchApplicants();
      } else {
        loginMessage.style.color = 'red';
        loginMessage.innerText = json.error || 'Login failed';
      }
    } catch (err) {
      loginMessage.style.color = 'red';
      loginMessage.innerText = 'Server error during login.';
    }
  });

  document.getElementById('downloadCsv').addEventListener('click', () => {
    window.open('http://localhost:5000/admin/download/csv', '_blank');
  });
});
