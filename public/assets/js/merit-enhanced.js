// Enhanced Merit List JavaScript with Database Integration
document.addEventListener('DOMContentLoaded', () => {
  console.log('🏆 Enhanced Merit List loaded');

  // DOM Elements
  const loadingIndicator = document.getElementById('loadingIndicator');
  const emptyState = document.getElementById('emptyState');
  const noSearchResults = document.getElementById('noSearchResults');
  const refreshBtn = document.getElementById('refreshList');
  const searchInput = document.getElementById('searchInput');
  const clearSearchBtn = document.getElementById('clearSearch');
  const streamFilter = document.getElementById('streamFilter');
  const sortOrder = document.getElementById('sortOrder');
  const clearAllFiltersBtn = document.getElementById('clearAllFilters');

  // Stream tabs
  const streamTabs = document.querySelectorAll('.stream-tab');
  const meritTableBody = document.getElementById('meritTableBody');
  const currentStreamTitle = document.getElementById('currentStreamTitle');
  const filteredCount = document.getElementById('filteredCount');

  // Stats elements
  const totalStudents = document.getElementById('totalStudents');
  const currentRank = document.getElementById('currentRank');

  // Count elements
  const allCount = document.getElementById('allCount');
  const scienceCount = document.getElementById('scienceCount');
  const artsCount = document.getElementById('artsCount');
  const commerceCount = document.getElementById('commerceCount');

  // State variables
  let allStudentsData = [];
  let filteredData = [];
  let currentStream = 'all';
  let currentSearchTerm = '';
  let currentSort = 'rank';

  // Initialize
  init();

  async function init() {
    await loadMeritData();
    setupEventListeners();
    applyFilters();
  }

  function setupEventListeners() {
    // Refresh button
    refreshBtn?.addEventListener('click', async () => {
      refreshBtn.innerHTML = '⏳ Loading...';
      await loadMeritData();
      refreshBtn.innerHTML = '🔄 Refresh';
    });

    // Search functionality
    searchInput?.addEventListener('input', debounce(handleSearch, 300));
    clearSearchBtn?.addEventListener('click', clearSearch);

    // Filter functionality
    streamFilter?.addEventListener('change', handleStreamFilter);
    sortOrder?.addEventListener('change', handleSort);
    clearAllFiltersBtn?.addEventListener('click', clearAllFilters);

    // Stream tabs
    streamTabs?.forEach(tab => {
      tab.addEventListener('click', () => handleStreamTab(tab.dataset.stream));
    });
  }

  async function loadMeritData() {
    console.log('🔄 Loading merit data...');
    showLoading(true);

    try {
      const baseURL = window.location.origin;
      const response = await fetch(`${baseURL}/merit`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('📊 Merit data received:', data);

      // Process the data to create a unified list with rankings
      allStudentsData = processStreamData(data);
      
      updateStatistics();
      updateStreamCounts(data);
      applyFilters();
      
    } catch (error) {
      console.error('❌ Error loading merit data:', error);
      showError('Failed to load merit data. Please try again.');
    } finally {
      showLoading(false);
    }
  }

  function processStreamData(data) {
    let allStudents = [];

    // Combine all streams
    Object.entries(data).forEach(([stream, students]) => {
      students.forEach((student, index) => {
        allStudents.push({
          ...student,
          stream: stream,
          streamRank: index + 1,
          overallRank: 0 // Will be calculated after combining all
        });
      });
    });

    // Sort by marks for overall ranking
    allStudents.sort((a, b) => {
      if (b.marks !== a.marks) {
        return b.marks - a.marks;
      }
      // Tie-breaker: earlier application date
      return new Date(a.createdAt) - new Date(b.createdAt);
    });

    // Assign overall ranks
    allStudents.forEach((student, index) => {
      student.overallRank = index + 1;
    });

    return allStudents;
  }

  function updateStatistics() {
    const total = allStudentsData.length;
    totalStudents.textContent = total;
    
    // For current rank, you could check if user's email is in localStorage
    // and show their rank if found
    const userEmail = localStorage.getItem('userEmail');
    if (userEmail) {
      const userStudent = allStudentsData.find(s => s.email === userEmail);
      currentRank.textContent = userStudent ? userStudent.overallRank : '--';
    } else {
      currentRank.textContent = '--';
    }
  }

  function updateStreamCounts(data) {
    allCount.textContent = allStudentsData.length;
    scienceCount.textContent = data.Science?.length || 0;
    artsCount.textContent = data.Arts?.length || 0;
    commerceCount.textContent = data.Commerce?.length || 0;
  }

  function applyFilters() {
    let filtered = [...allStudentsData];

    // Apply stream filter
    if (currentStream !== 'all') {
      filtered = filtered.filter(student => student.stream === currentStream);
    }

    // Apply search filter
    if (currentSearchTerm) {
      const term = currentSearchTerm.toLowerCase();
      filtered = filtered.filter(student => 
        student.name.toLowerCase().includes(term) ||
        student.email.toLowerCase().includes(term) ||
        student.preferredCourse.toLowerCase().includes(term)
      );
    }

    // Apply sorting
    filtered = applySorting(filtered);

    filteredData = filtered;
    updateTable();
    updateFilterInfo();
  }

  function applySorting(data) {
    switch (currentSort) {
      case 'rank':
        return data.sort((a, b) => {
          const rankA = currentStream === 'all' ? a.overallRank : a.streamRank;
          const rankB = currentStream === 'all' ? b.overallRank : b.streamRank;
          return rankA - rankB;
        });
      case 'marks-desc':
        return data.sort((a, b) => b.marks - a.marks);
      case 'marks-asc':
        return data.sort((a, b) => a.marks - b.marks);
      case 'name':
        return data.sort((a, b) => a.name.localeCompare(b.name));
      case 'recent':
        return data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      default:
        return data;
    }
  }

  function updateTable() {
    if (filteredData.length === 0) {
      showEmptyState();
      return;
    }

    hideEmptyStates();
    
    const tbody = meritTableBody;
    tbody.innerHTML = '';

    filteredData.forEach((student, index) => {
      const rank = currentSort === 'rank' 
        ? (currentStream === 'all' ? student.overallRank : student.streamRank)
        : index + 1;
      
      const row = createTableRow(student, rank);
      tbody.appendChild(row);
    });
  }

  function createTableRow(student, rank) {
    const row = document.createElement('tr');
    
    // Rank cell
    const rankCell = document.createElement('td');
    rankCell.innerHTML = getRankBadge(rank);
    row.appendChild(rankCell);

    // Student details cell
    const nameCell = document.createElement('td');
    nameCell.innerHTML = `
      <div class="student-info">
        <div class="student-name">${escapeHtml(student.name)}</div>
        <div class="student-email">${escapeHtml(student.email)}</div>
      </div>
    `;
    row.appendChild(nameCell);

    // Performance cell
    const marksCell = document.createElement('td');
    marksCell.innerHTML = `<span class="marks-badge ${getMarksClass(student.marks)}">${student.marks}%</span>`;
    row.appendChild(marksCell);

    // Course cell
    const courseCell = document.createElement('td');
    courseCell.textContent = student.preferredCourse || 'Not specified';
    courseCell.className = 'course-col';
    row.appendChild(courseCell);

    // Stream cell
    const streamCell = document.createElement('td');
    streamCell.innerHTML = `<span class="stream-badge stream-${student.stream.toLowerCase()}">${getStreamIcon(student.stream)} ${student.stream}</span>`;
    streamCell.className = 'stream-col';
    row.appendChild(streamCell);

    // Date cell
    const dateCell = document.createElement('td');
    dateCell.textContent = formatDate(student.createdAt);
    dateCell.className = 'date-col';
    row.appendChild(dateCell);

    return row;
  }

  function getRankBadge(rank) {
    let badgeClass, icon, text;
    
    switch (rank) {
      case 1:
        badgeClass = 'rank-1';
        icon = '🥇';
        text = '1st';
        break;
      case 2:
        badgeClass = 'rank-2';
        icon = '🥈';
        text = '2nd';
        break;
      case 3:
        badgeClass = 'rank-3';
        icon = '🥉';
        text = '3rd';
        break;
      default:
        badgeClass = 'rank-default';
        icon = '🏅';
        text = `${rank}th`;
    }

    return `<span class="rank-badge ${badgeClass}">${icon} ${text}</span>`;
  }

  function getMarksClass(marks) {
    if (marks >= 90) return 'marks-excellent';
    if (marks >= 75) return 'marks-good';
    if (marks >= 60) return 'marks-average';
    return 'marks-poor';
  }

  function getStreamIcon(stream) {
    const icons = {
      'Science': '🔬',
      'Arts': '🎨',
      'Commerce': '💼'
    };
    return icons[stream] || '📚';
  }

  function formatDate(dateString) {
    if (!dateString) return 'Unknown';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  }

  function updateFilterInfo() {
    filteredCount.textContent = filteredData.length;
    
    const streamNames = {
      'all': 'All Streams',
      'Science': '🔬 Science Stream',
      'Arts': '🎨 Arts Stream',
      'Commerce': '💼 Commerce Stream'
    };
    
    currentStreamTitle.textContent = streamNames[currentStream] + ' Merit List';
  }

  function handleSearch(event) {
    currentSearchTerm = event.target.value.trim();
    applyFilters();
    
    // Show/hide clear button
    if (clearSearchBtn) {
      clearSearchBtn.style.display = currentSearchTerm ? 'flex' : 'none';
    }
  }

  function clearSearch() {
    searchInput.value = '';
    currentSearchTerm = '';
    applyFilters();
    clearSearchBtn.style.display = 'none';
  }

  function handleStreamFilter(event) {
    currentStream = event.target.value;
    updateActiveTab(currentStream);
    applyFilters();
  }

  function handleStreamTab(stream) {
    currentStream = stream;
    streamFilter.value = stream;
    updateActiveTab(stream);
    applyFilters();
  }

  function updateActiveTab(stream) {
    streamTabs.forEach(tab => {
      tab.classList.toggle('active', tab.dataset.stream === stream);
    });
  }

  function handleSort(event) {
    currentSort = event.target.value;
    applyFilters();
  }

  function clearAllFilters() {
    // Reset all filters
    currentSearchTerm = '';
    currentStream = 'all';
    currentSort = 'rank';
    
    // Update UI
    searchInput.value = '';
    streamFilter.value = 'all';
    sortOrder.value = 'rank';
    clearSearchBtn.style.display = 'none';
    
    updateActiveTab('all');
    applyFilters();
  }

  function showLoading(show) {
    if (loadingIndicator) {
      loadingIndicator.style.display = show ? 'flex' : 'none';
    }
  }

  function showEmptyState() {
    hideLoading();
    
    if (currentSearchTerm || currentStream !== 'all') {
      // Show no search results
      if (noSearchResults) {
        noSearchResults.classList.remove('hidden');
      }
      if (emptyState) {
        emptyState.classList.add('hidden');
      }
    } else {
      // Show empty state
      if (emptyState) {
        emptyState.classList.remove('hidden');
      }
      if (noSearchResults) {
        noSearchResults.classList.add('hidden');
      }
    }
    
    // Hide table
    const tableContainer = document.querySelector('.merit-table-container');
    if (tableContainer) {
      tableContainer.style.display = 'none';
    }
  }

  function hideEmptyStates() {
    if (emptyState) {
      emptyState.classList.add('hidden');
    }
    if (noSearchResults) {
      noSearchResults.classList.add('hidden');
    }
    
    // Show table
    const tableContainer = document.querySelector('.merit-table-container');
    if (tableContainer) {
      tableContainer.style.display = 'block';
    }
  }

  function hideLoading() {
    showLoading(false);
  }

  function showError(message) {
    console.error('Error:', message);
    // You could implement a toast notification here
    alert(message);
  }

  // Utility functions
  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  function escapeHtml(text) {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
  }

  // Auto-refresh functionality
  let autoRefreshInterval;
  
  function startAutoRefresh() {
    // Refresh every 30 seconds
    autoRefreshInterval = setInterval(() => {
      console.log('🔄 Auto-refreshing merit data...');
      loadMeritData();
    }, 30000);
  }

  function stopAutoRefresh() {
    if (autoRefreshInterval) {
      clearInterval(autoRefreshInterval);
      autoRefreshInterval = null;
    }
  }

  // Start auto-refresh when page becomes visible
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      startAutoRefresh();
    } else {
      stopAutoRefresh();
    }
  });

  // Start auto-refresh initially
  startAutoRefresh();

  // Stop auto-refresh when page unloads
  window.addEventListener('beforeunload', stopAutoRefresh);
});