const axios = require('axios');

// Test script for debugging server issues
async function testServer() {
  const baseURL = process.env.SERVER_URL || 'http://localhost:5000';
  
  console.log('🔍 Testing server endpoints...');
  console.log('Base URL:', baseURL);
  
  try {
    // Test health check
    console.log('\n1. Testing health check...');
    const health = await axios.get(`${baseURL}/health`, { timeout: 10000 });
    console.log('✅ Health check:', health.data);
    
    // Test root endpoint
    console.log('\n2. Testing root endpoint...');
    const root = await axios.get(`${baseURL}/`, { timeout: 10000 });
    console.log('✅ Root endpoint status:', root.status);
    
    // Test merit API
    console.log('\n3. Testing merit API...');
    const merit = await axios.get(`${baseURL}/api/merit`, { timeout: 15000 });
    console.log('✅ Merit API:', merit.data);
    
  } catch (error) {
    console.error('❌ Test failed:', {
      message: error.message,
      code: error.code,
      status: error.response?.status,
      data: error.response?.data
    });
  }
}

// Run tests
testServer();