// merit.js — Enhanced merit list with better UX
document.addEventListener('DOMContentLoaded', () => {
  const tbody = document.querySelector('#meritTable tbody');
  const table = document.getElementById('meritTable');
  const loadingIndicator = document.getElementById('loadingIndicator');
  const emptyState = document.getElementById('emptyState');
  const refreshBtn = document.getElementById('refreshList');

  async function loadMeritList(showLoader = true) {
    try {
      if (showLoader) {
        showLoadingState();
      }
      
      const res = await fetch('http://localhost:5000/merit');
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const rows = await res.json();
      
      hideLoadingState();
      
      if (!rows || rows.length === 0) {
        showEmptyState();
        return;
      }
      
      renderMeritList(rows);
      
    } catch (err) {
      console.error('Error loading merit list:', err);
      hideLoadingState();
      showErrorState();
    }
  }

  function renderMeritList(rows) {
    tbody.innerHTML = '';
    
    rows.forEach((student, index) => {
      const tr = document.createElement('tr');
      tr.className = 'fade-in';
      tr.style.animationDelay = `${index * 0.05}s`;
      
      // Add medal icons for top 3
      let rankDisplay = index + 1;
      if (index === 0) rankDisplay = '🥇 1';
      else if (index === 1) rankDisplay = '🥈 2';
      else if (index === 2) rankDisplay = '🥉 3';
      
      tr.innerHTML = `
        <td><strong>${rankDisplay}</strong></td>
        <td>${escapeHtml(student.name)}</td>
        <td><strong>${student.marks}%</strong></td>
        <td>${escapeHtml(student.stream)}</td>
        <td>${escapeHtml(student.course)}</td>
      `;
      
      tbody.appendChild(tr);
    });
    
    showTable();
  }

  function showLoadingState() {
    loadingIndicator.classList.remove('hidden');
    table.classList.add('hidden');
    emptyState.classList.add('hidden');
  }

  function hideLoadingState() {
    loadingIndicator.classList.add('hidden');
  }

  function showTable() {
    table.classList.remove('hidden');
    emptyState.classList.add('hidden');
  }

  function showEmptyState() {
    table.classList.add('hidden');
    emptyState.classList.remove('hidden');
  }

  function showErrorState() {
    tbody.innerHTML = `
      <tr>
        <td colspan="5" style="text-align: center; padding: var(--space-xl); color: var(--danger);">
          ❌ Could not load merit list. Please check your connection and try again.
          <br><br>
          <button onclick="location.reload()" class="btn btn-outline">🔄 Retry</button>
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
    return text.replace(/[&<>"']/g, function(m) { return map[m]; });
  }

  // Refresh button handler
  refreshBtn.addEventListener('click', () => {
    refreshBtn.disabled = true;
    refreshBtn.innerHTML = '⏳ Refreshing...';
    
    loadMeritList().finally(() => {
      refreshBtn.disabled = false;
      refreshBtn.innerHTML = '🔄 Refresh List';
    });
  });

  // Initial load
  loadMeritList();
  
  // Auto-refresh every 30 seconds (increased from 15 for better performance)
  setInterval(() => loadMeritList(false), 30000);
  
  // Refresh when page becomes visible (user switches back to tab)
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      loadMeritList(false);
    }
  });
});
