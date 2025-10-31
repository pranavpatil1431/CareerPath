// admin.js — Enhanced admin interface with better UX
document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  const adminPanel = document.getElementById('adminPanel');
  const loginMessage = document.getElementById('loginMessage');
  const adminTable = document.getElementById('adminTable');
  const adminLoadingIndicator = document.getElementById('adminLoadingIndicator');
  const adminEmptyState = document.getElementById('adminEmptyState');
  
  let token = localStorage.getItem('adminToken') || null;

  async function fetchApplicants(showLoader = true) {
    try {
      if (showLoader) {
        showLoadingState();
      }

      const res = await fetch('http://localhost:5000/admin/applicants', {
        headers: { 'x-admin-token': token }
      });

      if (res.status === 401) {
        handleUnauthorized();
        return;
      }

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const rows = await res.json();
      hideLoadingState();
      
      if (!rows || rows.length === 0) {
        showEmptyState();
        return;
      }

      renderApplicants(rows);
      updateStats(rows);

    } catch (err) {
      console.error('Error fetching applicants:', err);
      hideLoadingState();
      showErrorMessage('Error loading applicant data. Please try again.', 'error');
    }
  }

  function renderApplicants(rows) {
    const tbody = document.querySelector('#adminTable tbody');
    tbody.innerHTML = '';
    
    rows.forEach((applicant, index) => {
      const tr = document.createElement('tr');
      tr.className = 'fade-in';
      tr.style.animationDelay = `${index * 0.03}s`;
      
      // Format date
      const appliedDate = new Date(applicant.applied_at).toLocaleString();
      
      // Add medal icons for top 3
      let rankDisplay = index + 1;
      if (index === 0) rankDisplay = '🥇 1';
      else if (index === 1) rankDisplay = '🥈 2';
      else if (index === 2) rankDisplay = '🥉 3';
      
      tr.innerHTML = `
        <td><strong>${rankDisplay}</strong></td>
        <td>${escapeHtml(applicant.name)}</td>
        <td><strong>${applicant.marks}%</strong></td>
        <td><a href="mailto:${escapeHtml(applicant.email)}">${escapeHtml(applicant.email)}</a></td>
        <td>${escapeHtml(applicant.stream)}</td>
        <td>${escapeHtml(applicant.course)}</td>
        <td>${appliedDate}</td>
      `;
      
      tbody.appendChild(tr);
    });
    
    showTable();
  }

  function updateStats(rows) {
    const totalApplicants = rows.length;
    const topMarks = rows.length > 0 ? Math.max(...rows.map(r => r.marks)) : 0;
    
    // Count by stream
    const scienceCount = rows.filter(r => r.stream === 'Science').length;
    const artsCount = rows.filter(r => r.stream === 'Arts').length;
    const commerceCount = rows.filter(r => r.stream === 'Commerce').length;
    
    document.getElementById('totalApplicants').textContent = totalApplicants;
    document.getElementById('scienceCount').textContent = scienceCount;
    document.getElementById('artsCount').textContent = artsCount;
    document.getElementById('commerceCount').textContent = commerceCount;
    document.getElementById('topMarks').textContent = topMarks + '%';
  }

  function showLoadingState() {
    adminLoadingIndicator.classList.remove('hidden');
    adminTable.classList.add('hidden');
    adminEmptyState.classList.add('hidden');
  }

  function hideLoadingState() {
    adminLoadingIndicator.classList.add('hidden');
  }

  function showTable() {
    adminTable.classList.remove('hidden');
    adminEmptyState.classList.add('hidden');
  }

  function showEmptyState() {
    adminTable.classList.add('hidden');
    adminEmptyState.classList.remove('hidden');
    // Reset stats
    document.getElementById('totalApplicants').textContent = '0';
    document.getElementById('avgMarks').textContent = '0%';
    document.getElementById('topMarks').textContent = '0%';
  }

  function handleUnauthorized() {
    localStorage.removeItem('adminToken');
    token = null;
    adminPanel.classList.add('hidden');
    loginForm.classList.remove('hidden');
    showLoginMessage('Session expired. Please login again.', 'error');
  }

  function showLoginMessage(text, type) {
    loginMessage.className = `message message-${type}`;
    loginMessage.textContent = text;
    loginMessage.classList.remove('hidden');
  }

  function showErrorMessage(text, type) {
    const tbody = document.querySelector('#adminTable tbody');
    tbody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align: center; padding: var(--space-xl); color: var(--danger);">
          ❌ ${text}
          <br><br>
          <button onclick="fetchApplicants()" class="btn btn-outline">🔄 Retry</button>
        </td>
      </tr>
    `;
    showTable();
  }

  function escapeHtml(text) {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return text ? text.replace(/[&<>"']/g, function(m) { return map[m]; }) : '';
  }

  // Check if already logged in
  if (token) {
    adminPanel.classList.remove('hidden');
    loginForm.classList.add('hidden');
    fetchApplicants();
  }

  // Login form handler
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const submitBtn = loginForm.querySelector('button[type="submit"]');
    const loginText = document.getElementById('loginText');
    const loginLoader = document.getElementById('loginLoader');
    
    // Show loading state
    submitBtn.disabled = true;
    loginText.classList.add('hidden');
    loginLoader.classList.remove('hidden');

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
        
        showLoginMessage('🎉 Login successful! Redirecting to dashboard...', 'success');
        
        setTimeout(() => {
          adminPanel.classList.remove('hidden');
          loginForm.classList.add('hidden');
          loginMessage.classList.add('hidden');
          fetchApplicants();
        }, 1000);
      } else {
        showLoginMessage(json.error || '❌ Invalid credentials. Please try again.', 'error');
      }
    } catch (err) {
      console.error('Login error:', err);
      showLoginMessage('❌ Connection error. Please check your network and try again.', 'error');
    } finally {
      // Reset button state
      submitBtn.disabled = false;
      loginText.classList.remove('hidden');
      loginLoader.classList.add('hidden');
    }
  });

  // Refresh data button
  document.getElementById('refreshData').addEventListener('click', () => {
    const refreshBtn = document.getElementById('refreshData');
    refreshBtn.disabled = true;
    refreshBtn.innerHTML = '⏳ Refreshing...';
    
    fetchApplicants().finally(() => {
      refreshBtn.disabled = false;
      refreshBtn.innerHTML = '🔄 Refresh Data';
    });
  });

  // Download CSV button
  document.getElementById('downloadCsv').addEventListener('click', () => {
    try {
      window.open(`http://localhost:5000/admin/download/csv?token=${token}`, '_blank');
    } catch (err) {
      console.error('Download error:', err);
      alert('Error downloading file. Please try again.');
    }
  });

  // Auto-refresh every 60 seconds when panel is visible
  setInterval(() => {
    if (!adminPanel.classList.contains('hidden') && !document.hidden) {
      fetchApplicants(false);
    }
  }, 60000);

  // Refresh when page becomes visible
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && !adminPanel.classList.contains('hidden')) {
      fetchApplicants(false);
    }
  });

  // Make fetchApplicants globally available for retry buttons
  window.fetchApplicants = fetchApplicants;
});
