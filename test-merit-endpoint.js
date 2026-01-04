// Test merit endpoint
import http from 'http';

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/merit',
  method: 'GET'
};

console.log('🧪 Testing merit endpoint...');

const req = http.request(options, (res) => {
  console.log(`📊 Status Code: ${res.statusCode}`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const parsed = JSON.parse(data);
      console.log('✅ Merit API Response:');
      console.log('- Science students:', parsed.Science?.length || 0);
      console.log('- Arts students:', parsed.Arts?.length || 0);
      console.log('- Commerce students:', parsed.Commerce?.length || 0);
      
      if (parsed.Science && parsed.Science.length > 0) {
        console.log('\n🏆 Top Science student:', parsed.Science[0].name, '-', parsed.Science[0].marks + '%');
      }
      if (parsed.Arts && parsed.Arts.length > 0) {
        console.log('🏆 Top Arts student:', parsed.Arts[0].name, '-', parsed.Arts[0].marks + '%');
      }
      if (parsed.Commerce && parsed.Commerce.length > 0) {
        console.log('🏆 Top Commerce student:', parsed.Commerce[0].name, '-', parsed.Commerce[0].marks + '%');
      }
    } catch (error) {
      console.error('❌ Failed to parse response:', error.message);
      console.log('Raw response:', data);
    }
    process.exit(0);
  });
});

req.on('error', (error) => {
  console.error('❌ Request failed:', error.message);
  process.exit(1);
});

req.end();