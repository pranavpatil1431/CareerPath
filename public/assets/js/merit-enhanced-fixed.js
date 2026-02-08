// Enhanced Merit List JavaScript with Complete Results Display
document.addEventListener('DOMContentLoaded', () => {
  console.log('🏆 Enhanced Merit List loaded with complete results functionality');

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
  let statsData = null;

  // Initialize
  init();

  async function init() {
    await loadMeritData();
    setupEventListeners();
    applyFilters();
    
    // Auto-refresh every 30 seconds for real-time updates
    setInterval(async () => {
      console.log('🔄 Auto-refreshing merit data...');
      await loadMeritData();
      applyFilters();
    }, 30000);
  }

  function setupEventListeners() {
    // Refresh button
    refreshBtn?.addEventListener('click', async () => {
      refreshBtn.innerHTML = '⏳ Loading...';
      refreshBtn.disabled = true;
      await loadMeritData();
      applyFilters();
      refreshBtn.innerHTML = '🔄 Refresh';
      refreshBtn.disabled = false;
    });

    // Excel export button
    const exportExcelBtn = document.getElementById('exportExcel');
    exportExcelBtn?.addEventListener('click', () => {
      try {
        const url = `${window.location.origin}/api/export/excel`;
        window.open(url, '_blank');
      } catch (err) {
        console.error('Excel export error:', err);
        alert('Error downloading Excel file. Please try again.');
      }
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

  // Function to display course selection statistics
  function displayCourseStatistics(courseStats) {
    console.log('📊 Displaying course statistics:', courseStats);
    
    // Find or create course statistics section
    let statsSection = document.getElementById('courseStatsSection');
    
    if (!statsSection) {
      // Create the statistics section if it doesn't exist
      statsSection = document.createElement('div');
      statsSection.id = 'courseStatsSection';
      statsSection.className = 'course-stats-section';
      
      const mainContent = document.querySelector('.main-content');
      const meritHeader = document.querySelector('.merit-header');
      
      if (mainContent && meritHeader) {
        mainContent.insertBefore(statsSection, meritHeader.nextSibling);
      }
    }
    
    if (courseStats && courseStats.length > 0) {
      statsSection.style.display = 'block';
      statsSection.innerHTML = `
        <div class="course-stats-title">
          📊 Course Selection Statistics
        </div>
        <div class="stats-grid">
          ${courseStats.map(stat => `
            <div class="stat-card">
              <div class="stat-percentage">${stat.percentage}%</div>
              <div class="stat-course">${stat.course}</div>
              <div class="stat-count">${stat.count} student${stat.count !== 1 ? 's' : ''}</div>
            </div>
          `).join('')}
        </div>
      `;
    } else {
      statsSection.style.display = 'none';
    }
  }

  async function loadMeritData() {
    console.log('📊 Loading merit data...');
    showLoading(true);

    try {
      console.log('🔗 Loading merit data for deployment environment...');
      
      // Multiple endpoint fallbacks for different deployment environments
      const endpoints = [
        '/api/merit',           // Vercel/Production API
        '/merit',               // Local development fallback
        `${window.location.origin}/api/merit`, // Full URL fallback
      ];
      
      let response = null;
      let lastError = null;
      
      for (const endpoint of endpoints) {
        try {
          console.log(`🔗 Trying endpoint: ${endpoint}`);
          response = await fetch(endpoint, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Cache-Control': 'no-cache'
            }
          });
          
          if (response.ok) {
            console.log(`✅ Success with endpoint: ${endpoint}`);
            break;
          } else {
            console.warn(`⚠️ Failed with ${endpoint}: ${response.status}`);
          }
        } catch (error) {
          console.warn(`⚠️ Error with ${endpoint}:`, error.message);
          lastError = error;
        }
      }
      
      if (!response || !response.ok) {
        throw lastError || new Error('All API endpoints failed');
      }

      const data = await response.json();
      console.log('📊 Merit data received:', data);
      console.log('📊 Data type:', typeof data, 'Is Array:', Array.isArray(data));

      let studentsArray = [];

      // Handle both new API format {success: true, data: []} and legacy array format
      if (data && data.success === true && Array.isArray(data.data)) {
        // New API format with success wrapper
        console.log('📊 Processing new API format, student count:', data.data.length);
        studentsArray = data.data;
        
        // Extract course statistics if available
        if (data.courseStats) {
          console.log('📊 Course statistics received:', data.courseStats);
          displayCourseStatistics(data.courseStats);
        }
      } else if (Array.isArray(data)) {
        // Legacy format - direct array of students
        console.log('📊 Processing legacy array format, length:', data.length);
        studentsArray = data;
      } else if (data && typeof data === 'object') {
        // Old complex format - grouped by streams (legacy support)
        console.log('📊 Processing legacy object format with streams');
        console.log('📊 Data keys:', Object.keys(data));
        
        // Extract students from stream groups
        if (data.Science && Array.isArray(data.Science)) {
          console.log('📊 Adding Science students:', data.Science.length);
          studentsArray.push(...data.Science);
        }
        if (data.Arts && Array.isArray(data.Arts)) {
          console.log('📊 Adding Arts students:', data.Arts.length);
          studentsArray.push(...data.Arts);
        }
        if (data.Commerce && Array.isArray(data.Commerce)) {
          console.log('📊 Adding Commerce students:', data.Commerce.length);
          studentsArray.push(...data.Commerce);
        }
        
        // Sort by marks if needed
        studentsArray.sort((a, b) => (b.marks || 0) - (a.marks || 0));
      } else {
        console.log('⚠️ No valid data found or unexpected format:', data);
        studentsArray = [];
      }

      console.log('📊 Total students extracted:', studentsArray.length);

      if (studentsArray.length === 0) {
        console.log('📊 No students found - showing empty state');
        allStudentsData = [];
        showEmptyState();
        showLoading(false);
        updateStreamCounts();
        return;
      }

      // Simple rank assignment like user's example
      allStudentsData = studentsArray.map((s, i) => ({
        _id: s._id || `student_${i}`,
        name: s.name || 'Unknown Student',
        email: s.email || '',
        marks: s.marks || 0,
        stream: s.stream || 'Science',
        preferredCourse: s.preferredCourse || s.course || 'Not specified',
        applicationId: s.applicationId || `APP${Date.now()}_${i}`,
        overallRank: i + 1,
        streamRank: i + 1,
        createdAt: s.createdAt || s.submittedAt || new Date(),
        subjects: s.subjects || []
      }));

      // Store stats from complex format if available
      if (data && data.stats) {
        statsData = data.stats;
      } else {
        statsData = null;
      }
      
      // Show appropriate notification
      if (allStudentsData.length === 0) {
        showNotification('📋 No student applications found in the merit list.', 'info');
        console.log('ℹ️ No students to display - showing empty state');
      } else {
        showNotification(`🎉 Merit list loaded with ${allStudentsData.length} students!`, 'success');
        console.log('✅ Merit data processed:', allStudentsData.length);
        console.log('👥 First student:', allStudentsData[0]);
      }
      
      // Hide loading and empty states
      showLoading(false);
      hideEmptyStates();
      
      updateCompleteStatistics();
      updateStreamCounts();
      
      // Make sure to apply filters and render the table
      console.log('🎯 About to call applyFilters...');
      applyFilters();
      
    } catch (error) {
      console.error('❌ Error loading merit data:', error);
      console.error('❌ Error stack:', error.stack);
      showError(`Failed to load merit data: ${error.message}`);
      
      // Show empty state if no data
      if (allStudentsData.length === 0) {
        showEmptyState();
      }
    } finally {
      showLoading(false);
    }
  }

  function processCompleteStreamData(data) {
    console.log('🔧 Processing complete stream data for all results:', data);
    let allStudents = [];

    if (!data) {
      console.log('❌ No data received for processing');
      return [];
    }

    // Handle different response formats
    if (data.success === false) {
      console.log('❌ Server returned error response:', data);
      return [];
    }

    // Process all stream data comprehensively
    const streams = ['Science', 'Arts', 'Commerce'];
    
    streams.forEach(stream => {
      const streamData = data[stream];
      console.log(`📊 Processing ${stream} stream:`, streamData);
      console.log(`📊 ${stream} data type:`, typeof streamData, 'Is Array:', Array.isArray(streamData));
      
      if (Array.isArray(streamData) && streamData.length > 0) {
        console.log(`✅ ${stream} has ${streamData.length} students`);
        
        streamData.forEach((student, index) => {
          try {
            // Ensure we have all required properties for complete results
            const processedStudent = {
              _id: student._id || `${stream.toLowerCase()}_${index}_${Date.now()}`,
              name: student.name || 'Unknown Student',
              email: student.email || '',
              marks: typeof student.marks === 'number' ? student.marks : 0,
              preferredCourse: student.preferredCourse || student.course || 'Not specified',
              stream: stream,
              streamRank: student.rank || (index + 1),
              overallRank: 0, // Will be calculated after combining all streams
              applicationId: student.applicationId || '',
              createdAt: student.createdAt || new Date().toISOString(),
              status: student.status || 'pending'
            };
            
            allStudents.push(processedStudent);
            console.log(`✅ Processed student: ${processedStudent.name} (${processedStudent.marks}% - ${stream} - Rank: ${processedStudent.streamRank})`);
          } catch (studentError) {
            console.error(`❌ Error processing student in ${stream}:`, studentError, student);
          }
        });
      } else {
        console.log(`⚠️ ${stream}: No valid data array found or empty array`);
        if (typeof streamData === 'number') {
          console.log(`📊 ${stream} returned count: ${streamData}`);
        }
      }
    });

    console.log('👥 Total students processed across all streams:', allStudents.length);
    
    if (allStudents.length === 0) {
      console.log('⚠️ No students found in any stream - checking if data has different structure');
      console.log('Raw data keys:', Object.keys(data));
      
      // Try to extract student data from other possible structures
      if (data.students && Array.isArray(data.students)) {
        console.log('📊 Found students array in data.students');
        allStudents = data.students.map((student, index) => ({
          _id: student._id || `student_${index}`,
          name: student.name || 'Unknown',
          email: student.email || '',
          marks: student.marks || 0,
          preferredCourse: student.course || 'Not specified',
          stream: student.stream || 'Science',
          streamRank: index + 1,
          overallRank: index + 1,
          applicationId: student.applicationId || '',
          createdAt: student.createdAt || new Date().toISOString(),
          status: student.status || 'pending'
        }));
      }
      
      if (allStudents.length === 0) {
        console.log('⚠️ Still no students found after checking alternative structures');
        return [];
      }
    }

    // Sort by marks for comprehensive overall ranking (highest first)
    allStudents.sort((a, b) => {
      // Primary sort: by marks (descending)
      if (b.marks !== a.marks) {
        return b.marks - a.marks;
      }
      // Tie-breaker: earlier application date gets preference
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      return dateA - dateB;
    });

    // Assign comprehensive overall ranks
    allStudents.forEach((student, index) => {
      student.overallRank = index + 1;
      console.log(`🏆 Overall Rank ${student.overallRank}: ${student.name} (${student.marks}% - ${student.stream})`);
    });

    console.log('🎯 Complete ranking processed successfully!');
    return allStudents;
  }

  function updateCompleteStatistics() {
    const total = allStudentsData.length;
    if (totalStudents) totalStudents.textContent = total;
    
    // Calculate and show comprehensive stats
    if (total > 0) {
      const avgMarks = (allStudentsData.reduce((sum, student) => sum + student.marks, 0) / total).toFixed(1);
      const topMarks = Math.max(...allStudentsData.map(s => s.marks));
      const streamDistribution = allStudentsData.reduce((acc, student) => {
        acc[student.stream] = (acc[student.stream] || 0) + 1;
        return acc;
      }, {});
      
      console.log('📈 Complete Statistics:', {
        total,
        averageMarks: avgMarks,
        topMarks,
        streamDistribution
      });
      
      // Add comprehensive results display
      const resultsContainer = document.querySelector('.merit-container') || document.querySelector('.container');
      if (resultsContainer && !document.querySelector('.comprehensive-stats-banner')) {
        const statsHTML = `
          <div class="comprehensive-stats-banner" style="
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px;
            border-radius: 15px;
            margin: 20px 0;
            text-align: center;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            animation: slideIn 0.5s ease-out;
          ">
            <h3 style="margin: 0 0 15px 0; font-size: 1.8em;">🏆 Complete Merit List Results</h3>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; margin-bottom: 15px;">
              <div style="background: rgba(255,255,255,0.2); padding: 15px; border-radius: 10px;">
                <div style="font-size: 2.5em; font-weight: bold; margin-bottom: 5px;">${total}</div>
                <div style="font-size: 1.1em;">Total Applications</div>
              </div>
              <div style="background: rgba(255,255,255,0.2); padding: 15px; border-radius: 10px;">
                <div style="font-size: 2.5em; font-weight: bold; margin-bottom: 5px;">${streamDistribution.Science || 0}</div>
                <div style="font-size: 1.1em;">🔬 Science</div>
              </div>
              <div style="background: rgba(255,255,255,0.2); padding: 15px; border-radius: 10px;">
                <div style="font-size: 2.5em; font-weight: bold; margin-bottom: 5px;">${streamDistribution.Commerce || 0}</div>
                <div style="font-size: 1.1em;">💼 Commerce</div>
              </div>
              <div style="background: rgba(255,255,255,0.2); padding: 15px; border-radius: 10px;">
                <div style="font-size: 2.5em; font-weight: bold; margin-bottom: 5px;">${streamDistribution.Arts || 0}</div>
                <div style="font-size: 1.1em;">🎨 Arts</div>
              </div>
            </div>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
              <div style="background: rgba(255,255,255,0.15); padding: 15px; border-radius: 10px;">
                📈 <strong>Average Merit: ${avgMarks}%</strong>
              </div>
              <div style="background: rgba(255,255,255,0.15); padding: 15px; border-radius: 10px;">
                🥇 <strong>Top Score: ${topMarks}%</strong>
              </div>
            </div>
          </div>
          <style>
            @keyframes slideIn {
              from { opacity: 0; transform: translateY(-20px); }
              to { opacity: 1; transform: translateY(0); }
            }
          </style>
        `;
        
        resultsContainer.insertAdjacentHTML('afterbegin', statsHTML);
      }
    }
    
    // Show user's rank if they have applied
    const userEmail = localStorage.getItem('userEmail');
    if (userEmail && currentRank) {
      const userStudent = allStudentsData.find(s => s.email.toLowerCase() === userEmail.toLowerCase());
      if (userStudent) {
        currentRank.textContent = userStudent.overallRank;
        currentRank.parentElement.style.background = 'linear-gradient(135deg, #10b981, #34d399)';
        currentRank.parentElement.style.color = 'white';
        console.log(`👤 User found! Rank: ${userStudent.overallRank}`);
        
        // Show personalized message
        showNotification(`🎉 Congratulations! Your current rank is #${userStudent.overallRank} out of ${total} students!`, 'success', 10000);
      } else {
        currentRank.textContent = '--';
      }
    } else if (currentRank) {
      currentRank.textContent = '--';
    }
  }

  function updateStreamCounts() {
    if (allCount) allCount.textContent = allStudentsData.length;
    
    const scienceStudents = allStudentsData.filter(s => s.stream === 'Science').length;
    const artsStudents = allStudentsData.filter(s => s.stream === 'Arts').length;
    const commerceStudents = allStudentsData.filter(s => s.stream === 'Commerce').length;
    
    if (scienceCount) scienceCount.textContent = scienceStudents;
    if (artsCount) artsCount.textContent = artsStudents;
    if (commerceCount) commerceCount.textContent = commerceStudents;
    
    // Update tab counts
    streamTabs?.forEach(tab => {
      const stream = tab.dataset.stream;
      const countElement = tab.querySelector('.tab-count');
      if (countElement) {
        switch(stream) {
          case 'all':
            countElement.textContent = allStudentsData.length;
            break;
          case 'Science':
            countElement.textContent = scienceStudents;
            break;
          case 'Arts':
            countElement.textContent = artsStudents;
            break;
          case 'Commerce':
            countElement.textContent = commerceStudents;
            break;
        }
      }
    });
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
      filtered = filtered.filter(student => {
        // Add null checks to prevent undefined errors
        const name = (student.name || '').toLowerCase();
        const email = (student.email || '').toLowerCase();
        const course = (student.preferredCourse || student.course || '').toLowerCase();
        const appId = (student.applicationId || '').toLowerCase();
        
        return name.includes(term) ||
               email.includes(term) ||
               course.includes(term) ||
               appId.includes(term);
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch(currentSort) {
        case 'rank':
          return currentStream === 'all' ? a.overallRank - b.overallRank : a.streamRank - b.streamRank;
        case 'name':
          return a.name.localeCompare(b.name);
        case 'marks':
          return b.marks - a.marks;
        case 'date':
          return new Date(b.createdAt) - new Date(a.createdAt);
        default:
          return a.overallRank - b.overallRank;
      }
    });

    filteredData = filtered;
    renderTable(filtered);
    updateFilteredCount(filtered.length);
    
    // Show appropriate state
    if (allStudentsData.length === 0) {
      showEmptyState();
    } else if (filtered.length === 0) {
      showNoSearchResults();
    } else {
      hideEmptyStates();
    }
  }

  function renderTable(students) {
    console.log('🎨 renderTable called with', students.length, 'students');
    console.log('📊 meritTableBody element:', meritTableBody);
    
    if (!meritTableBody) {
      console.error('❌ Merit table body not found');
      console.log('🔍 Searching for merit table body...');
      const tableBody = document.getElementById('meritTableBody');
      console.log('🔍 Found by ID search:', tableBody);
      return;
    }

    console.log(`🎨 Rendering ${students.length} students in table`);
    
    if (students.length === 0) {
      // Clear table and don't show it
      meritTableBody.innerHTML = '';
      return; // Let applyFilters handle showing the appropriate empty state
    }
    
    // Ensure table is visible when we have data
    const meritTable = document.querySelector('table');
    if (meritTable) meritTable.style.display = '';

    const tableRows = students.map((student, index) => {
      const displayRank = currentStream === 'all' ? student.overallRank : student.streamRank;
      const rankBadge = getRankBadge(displayRank);
      const marksBadge = getMarksBadge(student.marks);
      const streamBadge = getStreamBadge(student.stream);
      const formattedDate = formatDate(student.createdAt);
      
      return `
        <tr class="hover:bg-gray-50 transition-colors" data-student-id="${student._id}">
          <td class="px-4 py-3">${rankBadge}</td>
          <td class="px-4 py-3">
            <div class="font-semibold text-gray-900">${escapeHtml(student.name)}</div>
            <div class="text-sm text-gray-500">${escapeHtml(student.email)}</div>
            <div class="text-xs text-gray-400">ID: ${escapeHtml(student.applicationId)}</div>
          </td>
          <td class="px-4 py-3 text-center">${marksBadge}</td>
          <td class="px-4 py-3">
            <div class="font-medium">${escapeHtml(student.preferredCourse)}</div>
          </td>
          <td class="px-4 py-3 text-center">${streamBadge}</td>
          <td class="px-4 py-3 text-sm text-gray-500">${formattedDate}</td>
        </tr>
      `;
    }).join('');

    meritTableBody.innerHTML = tableRows;
    
    // Update current stream title
    if (currentStreamTitle) {
      const streamName = currentStream === 'all' ? 'All Streams' : currentStream;
      currentStreamTitle.textContent = `${streamName} Merit List`;
    }
  }

  function getRankBadge(rank) {
    let badgeClass, badgeText, icon;
    
    if (rank === 1) {
      badgeClass = 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-white';
      badgeText = '1st';
      icon = '🥇';
    } else if (rank === 2) {
      badgeClass = 'bg-gradient-to-r from-gray-300 to-gray-400 text-white';
      badgeText = '2nd';
      icon = '🥈';
    } else if (rank === 3) {
      badgeClass = 'bg-gradient-to-r from-orange-400 to-orange-500 text-white';
      badgeText = '3rd';
      icon = '🥉';
    } else {
      badgeClass = 'bg-gradient-to-r from-blue-500 to-blue-600 text-white';
      badgeText = `${rank}th`;
      icon = '🏅';
    }
    
    return `<span class="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold ${badgeClass}">
              ${icon} ${badgeText}
            </span>`;
  }

  function getMarksBadge(marks) {
    let badgeClass;
    
    if (marks >= 95) {
      badgeClass = 'bg-gradient-to-r from-green-500 to-green-600 text-white';
    } else if (marks >= 85) {
      badgeClass = 'bg-gradient-to-r from-blue-500 to-blue-600 text-white';
    } else if (marks >= 75) {
      badgeClass = 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white';
    } else {
      badgeClass = 'bg-gradient-to-r from-red-500 to-red-600 text-white';
    }
    
    return `<span class="inline-block px-3 py-1 rounded-full text-sm font-semibold ${badgeClass}">
              ${marks}%
            </span>`;
  }

  function getStreamBadge(stream) {
    let badgeClass;
    
    switch(stream) {
      case 'Science':
        badgeClass = 'bg-gradient-to-r from-blue-500 to-purple-600 text-white';
        break;
      case 'Arts':
        badgeClass = 'bg-gradient-to-r from-purple-500 to-pink-600 text-white';
        break;
      case 'Commerce':
        badgeClass = 'bg-gradient-to-r from-orange-500 to-red-600 text-white';
        break;
      default:
        badgeClass = 'bg-gray-500 text-white';
    }
    
    return `<span class="inline-block px-2 py-1 rounded text-xs font-semibold ${badgeClass}">
              ${stream}
            </span>`;
  }

  function formatDate(dateString) {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'N/A';
    }
  }

  function escapeHtml(unsafe) {
    if (!unsafe || typeof unsafe !== 'string') {
      return '';
    }
    return unsafe
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  // Event Handlers
  function handleSearch(e) {
    currentSearchTerm = e.target.value.trim();
    console.log(`🔍 Searching for: "${currentSearchTerm}"`);
    applyFilters();
  }

  function clearSearch() {
    if (searchInput) {
      searchInput.value = '';
      currentSearchTerm = '';
      applyFilters();
    }
  }

  function handleStreamFilter(e) {
    currentStream = e.target.value;
    console.log(`📊 Filtering by stream: ${currentStream}`);
    updateActiveTab(currentStream);
    applyFilters();
  }

  function handleSort(e) {
    currentSort = e.target.value;
    console.log(`🔄 Sorting by: ${currentSort}`);
    applyFilters();
  }

  function clearAllFilters() {
    currentStream = 'all';
    currentSearchTerm = '';
    currentSort = 'rank';
    
    if (searchInput) searchInput.value = '';
    if (streamFilter) streamFilter.value = 'all';
    if (sortOrder) sortOrder.value = 'rank';
    
    updateActiveTab('all');
    applyFilters();
  }

  function handleStreamTab(stream) {
    currentStream = stream;
    updateActiveTab(stream);
    if (streamFilter) streamFilter.value = stream;
    applyFilters();
  }

  function updateActiveTab(stream) {
    streamTabs?.forEach(tab => {
      if (tab.dataset.stream === stream) {
        tab.classList.add('active');
      } else {
        tab.classList.remove('active');
      }
    });
  }

  function updateFilteredCount(count) {
    if (filteredCount) {
      filteredCount.textContent = count;
    }
  }

  // UI State Management
  function showLoading(show) {
    if (loadingIndicator) {
      if (show) {
        loadingIndicator.classList.remove('hidden');
      } else {
        loadingIndicator.classList.add('hidden');
      }
    }
  }

  function showEmptyState() {
    const tableContainer = document.querySelector('.table-container, .table-wrapper, [class*="table"]');
    const meritTable = document.querySelector('table');
    
    if (emptyState) emptyState.classList.remove('hidden');
    if (noSearchResults) noSearchResults.classList.add('hidden');
    
    // Hide table when showing empty state
    if (meritTable) meritTable.style.display = 'none';
    if (tableContainer) tableContainer.style.display = 'none';
  }

  function showNoSearchResults() {
    if (noSearchResults) noSearchResults.classList.remove('hidden');
    if (emptyState) emptyState.classList.add('hidden');
  }

  function hideEmptyStates() {
    const tableContainer = document.querySelector('.table-container, .table-wrapper, [class*="table"]');
    const meritTable = document.querySelector('table');
    
    if (emptyState) emptyState.classList.add('hidden');
    if (noSearchResults) noSearchResults.classList.add('hidden');
    
    // Show table when hiding empty states
    if (meritTable) meritTable.style.display = '';
    if (tableContainer) tableContainer.style.display = '';
  }

  function showError(message) {
    console.error('🚨 Merit List Error:', message);
    showNotification(message, 'error');
  }

  function showNotification(message, type) {
    // Create notification element if it doesn't exist
    let notification = document.getElementById('meritNotification');
    if (!notification) {
      notification = document.createElement('div');
      notification.id = 'meritNotification';
      notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 10000;
        padding: 12px 20px;
        border-radius: 8px;
        font-weight: 600;
        max-width: 400px;
        transform: translateX(100%);
        transition: transform 0.3s ease;
      `;
      document.body.appendChild(notification);
    }

    // Set notification style based on type
    const styles = {
      success: 'background: linear-gradient(135deg, #10b981, #34d399); color: white;',
      error: 'background: linear-gradient(135deg, #ef4444, #f87171); color: white;',
      info: 'background: linear-gradient(135deg, #3b82f6, #60a5fa); color: white;'
    };

    notification.style.cssText += styles[type] || styles.info;
    notification.textContent = message;
    
    // Animate in
    requestAnimationFrame(() => {
      notification.style.transform = 'translateX(0)';
    });

    // Auto-hide after 5 seconds
    setTimeout(() => {
      notification.style.transform = 'translateX(100%)';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, 5000);
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

  // Initialize default active tab
  updateActiveTab('all');
  
  // Expose functions for debugging
  window.meritListDebug = {
    loadMeritData,
    allStudentsData: () => allStudentsData,
    filteredData: () => filteredData,
    statsData: () => statsData,
    refreshData: () => {
      loadMeritData().then(() => applyFilters());
    }
  };

  console.log('🎉 Enhanced Merit List with Complete Results functionality loaded successfully!');
});