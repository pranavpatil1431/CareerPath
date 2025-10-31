// merit.js — Fixed stream-wise merit list
document.addEventListener('DOMContentLoaded', () => {
  console.log('🏆 Merit list page loaded');

  // Get DOM elements
  const loadingIndicator = document.getElementById('loadingIndicator');
  const emptyState = document.getElementById('emptyState');
  const refreshBtn = document.getElementById('refreshList');
  
  // Stream elements
  const streamTabs = document.querySelectorAll('.stream-tab');
  const scienceTable = document.getElementById('scienceTable');
  const artsTable = document.getElementById('artsTable');
  const commerceTable = document.getElementById('commerceTable');
  const scienceBody = document.getElementById('scienceBody');
  const artsBody = document.getElementById('artsBody');
  const commerceBody = document.getElementById('commerceBody');
  
  console.log('📊 DOM Elements Status:', {
    loadingIndicator: !!loadingIndicator,
    emptyState: !!emptyState,
    refreshBtn: !!refreshBtn,
    streamTabs: streamTabs.length,
    scienceTable: !!scienceTable,
    artsTable: !!artsTable,
    commerceTable: !!commerceTable,
    scienceBody: !!scienceBody,
    artsBody: !!artsBody,
    commerceBody: !!commerceBody
  });

  let currentStream = 'Science';
  let meritData = {};

  async function loadMeritList() {
    console.log('🔄 Loading merit list...');
    
    // Show loading
    if (loadingIndicator) {
      loadingIndicator.classList.remove('hidden');
    }
    
    // Hide all content initially
    hideAllContent();

    try {
      // Try multiple URL formats to ensure it works
      const baseURL = window.location.origin;
      console.log('🌐 Base URL:', baseURL);
      
      const response = await fetch(`${baseURL}/merit`);
      console.log('📡 Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      meritData = await response.json();
      console.log('📥 Merit data received:', meritData);
      
      // Validate data structure
      if (!meritData || typeof meritData !== 'object') {
        throw new Error('Invalid data format received');
      }
      
      // Check if we have any data
      const totalStudents = (meritData.Science?.length || 0) + 
                           (meritData.Arts?.length || 0) + 
                           (meritData.Commerce?.length || 0);
      
      console.log(`📊 Total students: ${totalStudents}`);
      
      if (totalStudents === 0) {
        showEmptyState();
        return;
      }
      
      // Render all streams
      renderAllStreams();
      
      // Show current stream
      showCurrentStream();
      
      console.log('✅ Merit list loaded successfully');
      
    } catch (error) {
      console.error('❌ Error loading merit list:', error);
      showErrorState(error.message);
    } finally {
      // Hide loading
      if (loadingIndicator) {
        loadingIndicator.classList.add('hidden');
      }
    }
  }

  function hideAllContent() {
    if (scienceTable) scienceTable.classList.remove('active');
    if (artsTable) artsTable.classList.remove('active');
    if (commerceTable) commerceTable.classList.remove('active');
    if (emptyState) emptyState.classList.add('hidden');
  }

  function renderAllStreams() {
    console.log('🎨 Rendering all streams...');
    renderStreamTable('Science', scienceBody);
    renderStreamTable('Arts', artsBody);
    renderStreamTable('Commerce', commerceBody);
  }

  function renderStreamTable(streamName, tbody) {
    if (!tbody) {
      console.error(`❌ No tbody found for ${streamName} stream`);
      return;
    }

    const students = meritData[streamName] || [];
    console.log(`📋 Rendering ${streamName}: ${students.length} students`);

    // Clear existing content
    tbody.innerHTML = '';

    if (students.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="4" style="text-align: center; padding: 2rem; color: #666;">
            📝 No applications in ${streamName} stream yet
            <br><br>
            <a href="form.html" style="display: inline-block; padding: 0.5rem 1rem; background: #1e40af; color: white; text-decoration: none; border-radius: 0.375rem;">
              Be the First to Apply
            </a>
          </td>
        </tr>
      `;
      return;
    }

    // Render students
    students.forEach((student, index) => {
      const row = document.createElement('tr');
      
      // Create rank display
      let rankDisplay = student.rank || (index + 1);
      if (rankDisplay === 1) rankDisplay = '🥇 1st';
      else if (rankDisplay === 2) rankDisplay = '🥈 2nd';
      else if (rankDisplay === 3) rankDisplay = '🥉 3rd';
      else rankDisplay = `${rankDisplay}th`;
      
      // Create row content
      row.innerHTML = `
        <td>
          <span style="display: inline-block; padding: 0.25rem 0.5rem; background: ${getRankColor(student.rank || (index + 1))}; color: white; border-radius: 0.375rem; font-weight: 600; font-size: 0.875rem;">
            ${rankDisplay}
          </span>
        </td>
        <td>${escapeHtml(student.name)}</td>
        <td style="font-weight: 600; color: #1e40af;">${student.marks}%</td>
        <td>${escapeHtml(student.course)}</td>
      `;
      
      tbody.appendChild(row);
    });
  }

  function getRankColor(rank) {
    if (rank === 1) return '#ffd700'; // Gold
    if (rank === 2) return '#c0c0c0'; // Silver  
    if (rank === 3) return '#cd7f32'; // Bronze
    return '#6b7280'; // Gray
  }

  function showCurrentStream() {
    console.log(`👁️ Showing ${currentStream} stream`);
    
    // Hide all tables
    hideAllContent();
    
    // Show current table
    const currentTable = document.getElementById(`${currentStream.toLowerCase()}Table`);
    if (currentTable) {
      currentTable.classList.add('active');
      console.log(`✅ ${currentStream} table is now active`);
    } else {
      console.error(`❌ Could not find table for ${currentStream}`);
    }
    
    // Update tab states
    streamTabs.forEach(tab => {
      tab.classList.remove('active');
      if (tab.getAttribute('data-stream') === currentStream) {
        tab.classList.add('active');
      }
    });
  }

  function showEmptyState() {
    console.log('📭 Showing empty state');
    hideAllContent();
    if (emptyState) {
      emptyState.classList.remove('hidden');
    }
  }

  function showErrorState(errorMessage) {
    console.error('💥 Showing error state:', errorMessage);
    
    const errorHTML = `
      <tr>
        <td colspan="4" style="text-align: center; padding: 2rem; color: #dc2626;">
          ❌ Could not load merit list
          <br>
          <small style="color: #666;">Error: ${errorMessage}</small>
          <br><br>
          <button onclick="location.reload()" style="padding: 0.5rem 1rem; background: #dc2626; color: white; border: none; border-radius: 0.375rem; cursor: pointer;">
            🔄 Retry
          </button>
        </td>
      </tr>
    `;
    
    // Show error in all stream tables
    if (scienceBody) {
      scienceBody.innerHTML = errorHTML;
      if (scienceTable) scienceTable.classList.add('active');
    }
    if (artsBody) artsBody.innerHTML = errorHTML;
    if (commerceBody) commerceBody.innerHTML = errorHTML;
  }

  function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text.toString();
    return div.innerHTML;
  }

  // Tab switching
  streamTabs.forEach(tab => {
    tab.addEventListener('click', (e) => {
      e.preventDefault();
      const stream = tab.getAttribute('data-stream');
      console.log(`🔄 Tab clicked: ${stream}`);
      
      if (stream) {
        currentStream = stream;
        showCurrentStream();
      }
    });
  });

  // Refresh button
  if (refreshBtn) {
    refreshBtn.addEventListener('click', (e) => {
      e.preventDefault();
      console.log('🔄 Refresh button clicked');
      
      // Show loading state
      refreshBtn.innerHTML = '⏳ Refreshing...';
      refreshBtn.disabled = true;
      
      loadMeritList().finally(() => {
        refreshBtn.innerHTML = '🔄 Refresh List';
        refreshBtn.disabled = false;
      });
    });
  }

  // Initial load
  console.log('🚀 Starting initial merit list load...');
  loadMeritList();

  // Auto-refresh every 30 seconds
  setInterval(() => {
    console.log('⏰ Auto-refreshing merit list...');
    loadMeritList();
  }, 30000);

  // Refresh when page becomes visible
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      console.log('👁️ Page became visible, refreshing...');
      loadMeritList();
    }
  });

  console.log('✅ Merit list JavaScript initialized');
});