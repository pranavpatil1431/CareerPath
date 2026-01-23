import fetch from 'node-fetch';

// Test script for debugging server issues
async function testServer() {
  const baseURL = process.env.SERVER_URL || 'https://careerpath-2.onrender.com';
  
  console.log('🔍 Testing server endpoints...');
  console.log('Base URL:', baseURL);
  
  try {
    // Test health check
    console.log('\n1. Testing health check...');
    const healthResponse = await fetch(`${baseURL}/health`, { 
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });
    const health = await healthResponse.json();
    console.log('✅ Health check:', health);
    
    // Test merit API
    console.log('\n2. Testing merit API...');
    const meritResponse = await fetch(`${baseURL}/api/merit`, { 
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });
    const merit = await meritResponse.json();
    console.log('✅ Merit API response:', merit);
    console.log('📊 Total students found:', merit.data?.length || 0);
    
    if (merit.data && merit.data.length > 0) {
      console.log('👨‍🎓 Sample student data:');
      merit.data.slice(0, 3).forEach((student, index) => {
        console.log(`${index + 1}. ${student.name} - ${student.marks} marks - ${student.stream}`);
      });
    }
    
    // Test legacy merit endpoint
    console.log('\n3. Testing legacy merit endpoint...');
    const legacyResponse = await fetch(`${baseURL}/merit`, { 
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });
    const legacy = await legacyResponse.json();
    console.log('✅ Legacy merit response length:', legacy?.length || 0);
    
  } catch (error) {
    console.error('❌ Test failed:', {
      message: error.message,
      stack: error.stack
    });
  }
}

// Run tests
testServer();