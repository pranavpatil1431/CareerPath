import fetch from 'node-fetch';

// Test script for debugging merit list display issues
async function testMeritListSpecifically() {
  const baseURL = process.env.SERVER_URL || 'https://careerpath-2.onrender.com';
  
  console.log('🔍 Testing merit list endpoint specifically...');
  console.log('Base URL:', baseURL);
  
  try {
    // Test the main API endpoint that the merit page uses
    console.log('\n1. Testing /api/merit (main merit page endpoint)...');
    const meritResponse = await fetch(`${baseURL}/api/merit`, { 
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });
    
    console.log('Response Status:', meritResponse.status);
    console.log('Response Headers:', Object.fromEntries(meritResponse.headers.entries()));
    
    if (meritResponse.ok) {
      const merit = await meritResponse.json();
      console.log('✅ API Response Format:', {
        hasSuccess: 'success' in merit,
        successValue: merit.success,
        hasData: 'data' in merit,
        dataType: typeof merit.data,
        isDataArray: Array.isArray(merit.data),
        totalCount: merit.count || 'unknown',
        actualDataLength: merit.data?.length || 'unknown'
      });
      
      if (merit.data && merit.data.length > 0) {
        console.log('\n👥 First 5 students from API:');
        merit.data.slice(0, 5).forEach((student, index) => {
          console.log(`${index + 1}. ${student.name} - ${student.marks}% - ${student.stream} - ${student.preferredCourse}`);
        });
        
        console.log('\n📊 Stream breakdown:');
        const streamCounts = {};
        merit.data.forEach(student => {
          streamCounts[student.stream] = (streamCounts[student.stream] || 0) + 1;
        });
        Object.entries(streamCounts).forEach(([stream, count]) => {
          console.log(`   ${stream}: ${count} students`);
        });
      } else {
        console.log('❌ No student data found in API response');
      }
    } else {
      console.log('❌ API request failed with status:', meritResponse.status);
      const errorText = await meritResponse.text();
      console.log('Error response:', errorText.substring(0, 200));
    }
    
    // Test the legacy endpoint too
    console.log('\n2. Testing /merit (legacy endpoint)...');
    const legacyResponse = await fetch(`${baseURL}/merit`, { 
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });
    
    if (legacyResponse.ok) {
      const legacy = await legacyResponse.json();
      console.log('✅ Legacy endpoint data length:', legacy?.length || 0);
    } else {
      console.log('⚠️ Legacy endpoint failed (expected)');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', {
      message: error.message,
      stack: error.stack
    });
  }
}

// Run tests
testMeritListSpecifically();