// Simple test for apply functionality
import http from 'http';

const testStudent = {
  name: 'Quick Test Student',
  email: 'quicktest@example.com', 
  marks: 87,
  stream: 'Science',
  course: 'Physics'
};

const postData = JSON.stringify(testStudent);

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/apply',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

console.log('🧪 Testing Apply Form Functionality...');
console.log('Submitting student:', testStudent);

const req = http.request(options, (res) => {
  console.log(`📊 Status: ${res.statusCode}`);
  
  let responseData = '';
  res.on('data', (chunk) => responseData += chunk);
  
  res.on('end', () => {
    try {
      const result = JSON.parse(responseData);
      console.log('✅ Apply Response:', result);
      
      if (result.ok) {
        console.log('🎉 Student added successfully!');
        console.log('- Name:', result.student.name);
        console.log('- Marks:', result.student.marks + '%');
        console.log('- Stream:', result.student.stream);
        console.log('- Application ID:', result.id);
        
        // Now test merit list to see if it updated
        testMeritList();
      } else {
        console.log('❌ Application failed:', result.error);
        process.exit(1);
      }
    } catch (e) {
      console.error('❌ Failed to parse response:', e.message);
      console.log('Raw response:', responseData);
      process.exit(1);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Request failed:', error.message);
  process.exit(1);
});

req.write(postData);
req.end();

function testMeritList() {
  console.log('\n🏆 Testing Merit List Update...');
  
  const meritOptions = {
    hostname: 'localhost',
    port: 5000,
    path: '/merit',
    method: 'GET'
  };
  
  const meritReq = http.request(meritOptions, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      try {
        const merit = JSON.parse(data);
        console.log('📋 Merit List Updated:');
        console.log('- Science students:', merit.Science?.length || 0);
        console.log('- Arts students:', merit.Arts?.length || 0);
        console.log('- Commerce students:', merit.Commerce?.length || 0);
        
        if (merit.Science && merit.Science.length > 0) {
          console.log('\n🥇 Top Science students:');
          merit.Science.slice(0, 3).forEach((student, index) => {
            console.log(`${index + 1}. ${student.name} - ${student.marks}%`);
          });
        }
        
        console.log('\n✅ Apply form and merit list are working correctly!');
        process.exit(0);
        
      } catch (e) {
        console.error('❌ Merit list error:', e.message);
        process.exit(1);
      }
    });
  });
  
  meritReq.on('error', (error) => {
    console.error('❌ Merit request failed:', error.message);
    process.exit(1);
  });
  
  meritReq.end();
}