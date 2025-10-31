// merit.js — Simple stream-wise merit list (debug version)
document.addEventListener('DOMContentLoaded', () => {
  console.log('Merit list page loaded');

  // Test basic elements
  const loadingIndicator = document.getElementById('loadingIndicator');
  const emptyState = document.getElementById('emptyState');
  const refreshBtn = document.getElementById('refreshList');
  
  console.log('Basic elements:', {
    loadingIndicator: !!loadingIndicator,
    emptyState: !!emptyState,
    refreshBtn: !!refreshBtn
  });

  // Test stream elements
  const streamTabs = document.querySelectorAll('.stream-tab');
  const scienceTable = document.getElementById('scienceTable');
  const artsTable = document.getElementById('artsTable');
  const commerceTable = document.getElementById('commerceTable');
  const scienceBody = document.getElementById('scienceBody');
  const artsBody = document.getElementById('artsBody');
  const commerceBody = document.getElementById('commerceBody');
  
  console.log('Stream elements:', {
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
    console.log('Loading merit list...');
    
    if (loadingIndicator) {
      loadingIndicator.classList.remove('hidden');
    }

    try {
      const response = await fetch(`${window.location.origin}/merit`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      meritData = await response.json();
      console.log('Merit data loaded:', meritData);
      
      // Render each stream
      renderStream('Science', scienceBody);
      renderStream('Arts', artsBody);
      renderStream('Commerce', commerceBody);
      
      // Show the current stream
      showStream(currentStream);
      
    } catch (error) {
      console.error('Error loading merit list:', error);
      // Show error in all tables
      if (scienceBody) scienceBody.innerHTML = `<tr><td colspan="4">Error: ${error.message}</td></tr>`;
      if (artsBody) artsBody.innerHTML = `<tr><td colspan="4">Error: ${error.message}</td></tr>`;
      if (commerceBody) commerceBody.innerHTML = `<tr><td colspan="4">Error: ${error.message}</td></tr>`;
    }
    
    if (loadingIndicator) {
      loadingIndicator.classList.add('hidden');
    }
  }

  function renderStream(streamName, tbody) {
    if (!tbody) {
      console.error(`No tbody found for ${streamName}`);
      return;
    }

    const students = meritData[streamName] || [];
    console.log(`Rendering ${streamName} with ${students.length} students`);

    if (students.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="4" style="text-align: center; padding: 20px; color: #666;">
            📝 No applications in ${streamName} stream yet
            <br><br>
            <a href="form.html" class="btn btn-outline">Be the First to Apply</a>
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = '';
    
    students.forEach((student, index) => {
      const row = document.createElement('tr');
      
      let rankDisplay = student.rank || (index + 1);
      if (rankDisplay === 1) rankDisplay = '🥇 1st';
      else if (rankDisplay === 2) rankDisplay = '🥈 2nd';
      else if (rankDisplay === 3) rankDisplay = '🥉 3rd';
      else rankDisplay = `${rankDisplay}th`;
      
      row.innerHTML = `
        <td><span class="rank-badge">${rankDisplay}</span></td>
        <td>${escapeHtml(student.name)}</td>
        <td style="font-weight: 600; color: #1e40af;">${student.marks}%</td>
        <td>${escapeHtml(student.course)}</td>
      `;
      
      tbody.appendChild(row);
    });
  }

  function showStream(streamName) {
    console.log(`Showing stream: ${streamName}`);
    
    // Hide all tables
    if (scienceTable) scienceTable.classList.remove('active');
    if (artsTable) artsTable.classList.remove('active');
    if (commerceTable) commerceTable.classList.remove('active');
    
    // Show selected table
    const tableToShow = document.getElementById(`${streamName.toLowerCase()}Table`);
    if (tableToShow) {
      tableToShow.classList.add('active');
      console.log(`Made ${streamName} table active`);
    } else {
      console.error(`Could not find table for ${streamName}`);
    }
    
    // Update tab states
    streamTabs.forEach(tab => {
      tab.classList.remove('active');
      if (tab.getAttribute('data-stream') === streamName) {
        tab.classList.add('active');
      }
    });
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Tab click handlers
  streamTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const stream = tab.getAttribute('data-stream');
      console.log(`Tab clicked: ${stream}`);
      currentStream = stream;
      showStream(stream);
    });
  });

  // Refresh button
  if (refreshBtn) {
    refreshBtn.addEventListener('click', () => {
      console.log('Refresh clicked');
      loadMeritList();
    });
  }

  // Initial load
  console.log('Starting initial load...');
  loadMeritList();
});