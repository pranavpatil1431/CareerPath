// merit.js — Enhanced stream-wise merit list
document.addEventListener('DOMContentLoaded', () => {
  const loadingIndicator = document.getElementById('loadingIndicator');
  const emptyState = document.getElementById('emptyState');
  const refreshBtn = document.getElementById('refreshList');
  
  // Stream elements
  const streamTabs = document.querySelectorAll('.stream-tab');
  const streamContents = document.querySelectorAll('.stream-content');
  const scienceBody = document.getElementById('scienceBody');
  const artsBody = document.getElementById('artsBody');
  const commerceBody = document.getElementById('commerceBody');
  
  let currentStream = 'Science';
  let meritData = {};

  async function loadMeritList(showLoader = true) {
    try {
      if (showLoader) showLoadingState();
      
      const response = await fetch('/merit');
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      meritData = await response.json();
      
      // Check if any stream has data
      const hasData = Object.values(meritData).some(streamData => streamData.length > 0);
      
      if (!hasData) {
        showEmptyState();
      } else {
        renderAllStreams();
        showCurrentStream();
      }
      
    } catch (err) {
      console.error('Error loading merit list:', err);
      showErrorState();
    } finally {
      hideLoadingState();
    }
  }

  function renderAllStreams() {
    renderStreamList('Science', scienceBody);
    renderStreamList('Arts', artsBody);
    renderStreamList('Commerce', commerceBody);
  }

  function renderStreamList(stream, tbody) {
    tbody.innerHTML = '';
    
    const students = meritData[stream] || [];
    
    if (students.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="4" style="text-align: center; padding: var(--space-xl); color: var(--text-secondary);">
            📝 No applications in ${stream} stream yet
            <br><br>
            <a href="form.html" class="btn btn-outline">Be the First to Apply</a>
          </td>
        </tr>
      `;
      return;
    }
    
    students.forEach((student, index) => {
      const row = document.createElement('tr');
      
      // Add special styling for top 3 ranks
      if (index < 3) {
        row.classList.add(`rank-${index + 1}`);
      }
      
      // Create rank badge
      let rankDisplay = student.rank;
      if (student.rank === 1) rankDisplay = '🥇 1st';
      else if (student.rank === 2) rankDisplay = '🥈 2nd';
      else if (student.rank === 3) rankDisplay = '🥉 3rd';
      else rankDisplay = `${student.rank}th`;
      
      row.innerHTML = `
        <td>
          <span class="rank-badge ${student.rank <= 3 ? `rank-${student.rank}` : ''}">${rankDisplay}</span>
        </td>
        <td>${escapeHtml(student.name)}</td>
        <td style="font-weight: 600; color: var(--primary);">${student.marks}%</td>
        <td>${escapeHtml(student.course)}</td>
      `;
      
      tbody.appendChild(row);
    });
  }

  function showLoadingState() {
    loadingIndicator.classList.remove('hidden');
    streamContents.forEach(content => content.classList.add('hidden'));
    emptyState.classList.add('hidden');
  }

  function hideLoadingState() {
    loadingIndicator.classList.add('hidden');
  }

  function showCurrentStream() {
    // Hide all stream contents
    streamContents.forEach(content => content.classList.remove('active'));
    
    // Show current stream
    const currentContent = document.getElementById(`${currentStream.toLowerCase()}Table`);
    if (currentContent) {
      currentContent.classList.add('active');
    }
    
    emptyState.classList.add('hidden');
  }

  function showEmptyState() {
    streamContents.forEach(content => content.classList.remove('active'));
    emptyState.classList.remove('hidden');
  }

  function showErrorState() {
    scienceBody.innerHTML = commerceBody.innerHTML = artsBody.innerHTML = `
      <tr>
        <td colspan="4" style="text-align: center; padding: var(--space-xl); color: var(--danger);">
          ❌ Could not load merit list. Please check your connection and try again.
          <br><br>
          <button onclick="location.reload()" class="btn btn-outline">🔄 Retry</button>
        </td>
      </tr>
    `;
    showCurrentStream();
  }

  function escapeHtml(text) {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return text.toString().replace(/[&<>"']/g, m => map[m]);
  }

  // Tab switching functionality
  streamTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const stream = tab.getAttribute('data-stream');
      
      // Update active tab
      streamTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      
      // Update current stream and show content
      currentStream = stream;
      showCurrentStream();
    });
  });

  // Refresh button handler
  refreshBtn.addEventListener('click', () => {
    loadMeritList(true);
    
    // Provide user feedback
    refreshBtn.innerHTML = '⏳ Refreshing...';
    setTimeout(() => {
      refreshBtn.innerHTML = '🔄 Refresh List';
    }, 1000);
  });

  // Initial load
  loadMeritList();
  
  // Auto-refresh every 30 seconds
  setInterval(() => loadMeritList(false), 30000);
  
  // Refresh when page becomes visible
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      loadMeritList(false);
    }
  });
});