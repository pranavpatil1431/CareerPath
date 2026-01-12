// merit.js — Enhanced mobile-friendly stream-wise merit list
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

  // Check if mobile device
  function isMobile() {
    return window.innerWidth <= 768;
  }

  // Mobile-friendly card renderer
  function renderMobileCard(student, rank) {
    const rankBadge = getRankBadge(rank);
    return `
      <div class="merit-card">
        <div class="merit-rank">
          ${rankBadge}
          <div class="merit-details">
            <div class="merit-name">${student.name}</div>
            <div class="merit-course">📚 ${student.preferredCourse}</div>
          </div>
          <div class="merit-marks">${student.marks}%</div>
        </div>
      </div>
    `;
  }

  // Desktop table row renderer
  function renderTableRow(student, rank) {
    const rankBadge = getRankBadge(rank);
    return `
      <tr>
        <td data-label="Rank">${rankBadge}</td>
        <td data-label="Name">${student.name}</td>
        <td data-label="Marks" style="font-weight: 600; color: #1e40af;">${student.marks}%</td>
        <td data-label="Course">${student.preferredCourse}</td>
      </tr>
    `;
  }

  function getRankBadge(rank) {
    const badges = {
      1: '<span style="display: inline-block; padding: 0.25rem 0.5rem; background: #ffd700; color: white; border-radius: 0.375rem; font-weight: 600; font-size: 0.875rem;">🥇 1st</span>',
      2: '<span style="display: inline-block; padding: 0.25rem 0.5rem; background: #c0c0c0; color: white; border-radius: 0.375rem; font-weight: 600; font-size: 0.875rem;">🥈 2nd</span>',
      3: '<span style="display: inline-block; padding: 0.25rem 0.5rem; background: #cd7f32; color: white; border-radius: 0.375rem; font-weight: 600; font-size: 0.875rem;">🥉 3rd</span>'
    };
    
    return badges[rank] || `<span style="display: inline-block; padding: 0.25rem 0.5rem; background: #6b7280; color: white; border-radius: 0.375rem; font-weight: 600; font-size: 0.875rem;">${rank}th</span>`;
  }

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
      
      const urls = [
        '/api/merit',
        `/api/merit`,
        `${window.location.origin}/api/merit`,
        '/merit'
      ];
      
      let response = null;
      let lastError = null;
      
      for (const url of urls) {
        try {
          console.log(`📡 Attempting API call to: ${url}`);
          const fetchResponse = await fetch(url, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
              'Cache-Control': 'no-cache'
            }
          });
          
          console.log(`📊 Response status: ${fetchResponse.status}`);
          
          if (fetchResponse.ok) {
            response = fetchResponse;
            console.log(`✅ Successfully connected to: ${url}`);
            break;
          } else {
            console.log(`❌ Failed with status ${fetchResponse.status} for: ${url}`);
          }
        } catch (err) {
          console.log(`❌ Network error for ${url}:`, err.message);
          lastError = err;
        }
      }
      
      if (!response) {
        throw new Error(`Failed to connect to server. Last error: ${lastError?.message}`);
      }

      const data = await response.json();
      console.log('📋 Merit data received:', data);

      // Handle both API response formats
      if (data.success && data.data) {
        // API format: {success: true, data: meritByStream}
        meritData = data.data;
        console.log('✅ Merit data processed from API response wrapper:', {
          Science: meritData.Science?.length || 0,
          Arts: meritData.Arts?.length || 0,
          Commerce: meritData.Commerce?.length || 0
        });
      } else if (data.Science || data.Arts || data.Commerce) {
        // Direct format: meritByStream (from server.js)
        meritData = data;
        console.log('✅ Merit data processed directly from server:', {
          Science: meritData.Science?.length || 0,
          Arts: meritData.Arts?.length || 0,
          Commerce: meritData.Commerce?.length || 0
        });
      } else {
        // Fallback: try direct data format
        meritData = data;
        console.log('⚠️ Unknown merit data format, using as-is:', {
          Science: meritData.Science?.length || 0,
          Arts: meritData.Arts?.length || 0,
          Commerce: meritData.Commerce?.length || 0
        });
      }
      
      renderAllStreams();
      showCurrentStream();
        
      // Show success message
      showNotification('✅ Merit list loaded successfully!', 'success');

    } catch (error) {
      console.error('❌ Error loading merit list:', error);
      showError(`Failed to load merit list: ${error.message}`);
      showEmptyState();
    } finally {
      if (loadingIndicator) {
        loadingIndicator.classList.add('hidden');
      }
    }
  }

  function renderAllStreams() {
    console.log('🎨 Rendering all streams...');
    
    // Render each stream
    renderStream('Science', scienceBody);
    renderStream('Arts', artsBody);
    renderStream('Commerce', commerceBody);
  }

  function renderStream(stream, tableBody) {
    if (!tableBody) {
      console.error(`❌ Table body not found for ${stream}`);
      return;
    }

    const students = meritData[stream] || [];
    console.log(`📊 Rendering ${stream} stream with ${students.length} students`);

    if (students.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="4" style="text-align: center; padding: 2rem; color: var(--text-secondary);">
            <div style="font-size: 3rem; margin-bottom: 1rem;">📚</div>
            <strong>No students in ${stream} stream yet</strong>
            <br>
            <small>Applications will appear here once submitted</small>
          </td>
        </tr>
      `;
      return;
    }

    // Check if mobile and render accordingly
    if (isMobile()) {
      // For mobile, replace table with cards
      const container = tableBody.closest('.stream-content');
      const table = container.querySelector('.doc-table');
      
      let mobileHTML = '<div class="mobile-merit-container">';
      students.forEach((student, index) => {
        mobileHTML += renderMobileCard(student, index + 1);
      });
      mobileHTML += '</div>';
      
      // Replace table with mobile cards
      table.style.display = 'none';
      
      let mobileContainer = container.querySelector('.mobile-merit-container');
      if (!mobileContainer) {
        const wrapper = document.createElement('div');
        wrapper.innerHTML = mobileHTML;
        container.appendChild(wrapper.firstElementChild);
      } else {
        mobileContainer.innerHTML = mobileHTML.replace('<div class="mobile-merit-container">', '').replace('</div>', '');
      }
    } else {
      // For desktop, use table
      const container = tableBody.closest('.stream-content');
      const table = container.querySelector('.doc-table');
      const mobileContainer = container.querySelector('.mobile-merit-container');
      
      if (mobileContainer) {
        mobileContainer.style.display = 'none';
      }
      table.style.display = 'table';
      
      let html = '';
      students.forEach((student, index) => {
        html += renderTableRow(student, index + 1);
      });
      tableBody.innerHTML = html;
    }
  }

  function hideAllContent() {
    [scienceTable, artsTable, commerceTable].forEach(table => {
      if (table) table.classList.remove('active');
    });
    
    if (emptyState) emptyState.classList.add('hidden');
  }

  function showCurrentStream() {
    console.log(`👀 Showing ${currentStream} stream`);
    
    hideAllContent();
    
    // Show selected stream
    const streamMap = {
      'Science': scienceTable,
      'Arts': artsTable,
      'Commerce': commerceTable
    };
    
    const targetTable = streamMap[currentStream];
    if (targetTable) {
      targetTable.classList.add('active');
    }

    // Update tab states
    streamTabs.forEach(tab => {
      const tabStream = tab.dataset.stream;
      if (tabStream === currentStream) {
        tab.classList.add('active');
      } else {
        tab.classList.remove('active');
      }
    });
  }

  function showEmptyState() {
    hideAllContent();
    if (emptyState) {
      emptyState.classList.remove('hidden');
    }
  }

  function showError(message) {
    console.error('🚨 Error:', message);
    
    // Show error in all stream bodies
    const errorHTML = `
      <tr>
        <td colspan="4" style="text-align: center; padding: 2rem; color: var(--danger);">
          <div style="font-size: 2rem; margin-bottom: 1rem;">⚠️</div>
          <strong>Error Loading Data</strong>
          <br>
          <small>${message}</small>
          <br><br>
          <button onclick="location.reload()" class="btn btn-outline">
            🔄 Refresh Page
          </button>
        </td>
      </tr>
    `;
    
    [scienceBody, artsBody, commerceBody].forEach(body => {
      if (body) body.innerHTML = errorHTML;
    });
    
    showCurrentStream();
  }

  function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 1rem 1.5rem;
      background: ${type === 'success' ? 'var(--success)' : 'var(--info)'};
      color: white;
      border-radius: var(--radius-md);
      box-shadow: var(--shadow-lg);
      z-index: 1000;
      animation: slideIn 0.3s ease-out;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
      notification.remove();
    }, 3000);
  }

  // Auto-refresh functionality for real-time updates
  let autoRefreshInterval;
  let lastUpdateTime = Date.now();

  function startAutoRefresh() {
    // Refresh every 30 seconds to catch new student applications
    autoRefreshInterval = setInterval(() => {
      console.log('🔄 Auto-refreshing merit list for new applications...');
      loadMeritList();
    }, 30000); // 30 seconds
  }

  function stopAutoRefresh() {
    if (autoRefreshInterval) {
      clearInterval(autoRefreshInterval);
      autoRefreshInterval = null;
    }
  }

  // Handle page visibility to stop/start auto-refresh
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      console.log('📴 Page hidden, stopping auto-refresh');
      stopAutoRefresh();
    } else {
      console.log('👁️ Page visible, starting auto-refresh');
      startAutoRefresh();
      // Immediate refresh when user returns to page
      loadMeritList();
    }
  });

  // Event Listeners
  streamTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const stream = tab.dataset.stream;
      console.log(`🔄 Switching to ${stream} stream`);
      
      currentStream = stream;
      showCurrentStream();
    });
  });

  if (refreshBtn) {
    refreshBtn.addEventListener('click', () => {
      console.log('🔄 Manual refresh triggered');
      showNotification('🔄 Refreshing merit list...', 'info');
      loadMeritList();
    });
  }

  // Handle window resize for responsive design
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      if (Object.keys(meritData).length > 0) {
        renderAllStreams();
        showCurrentStream();
      }
    }, 250);
  });

  // Initial load
  console.log('🚀 Starting initial merit list load...');
  loadMeritList().then(() => {
    // Start auto-refresh after initial load
    console.log('⏰ Starting auto-refresh for real-time updates...');
    startAutoRefresh();
    
    // Show notification about auto-refresh
    setTimeout(() => {
      showNotification('🔄 Merit list will auto-update every 30 seconds for new applications', 'info');
    }, 2000);
  });
});

// Add CSS animation for notifications
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  
  .mobile-merit-container {
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
  }
  
  @media (max-width: 768px) {
    .doc-table {
      display: none !important;
    }
    
    .mobile-merit-container {
      display: block !important;
    }
  }
  
  @media (min-width: 769px) {
    .mobile-merit-container {
      display: none !important;
    }
  }
`;
document.head.appendChild(style);