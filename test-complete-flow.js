// Comprehensive test of Apply Form -> Merit List flow
import http from 'http';

console.log('🧪 COMPREHENSIVE TEST: Apply Form -> Merit List Flow');
console.log('='.repeat(60));

// Test student data
const testStudent = {
  name: 'Test Student Flow Check',
  email: 'flowcheck@example.com',
  marks: 94,
  stream: 'Science', 
  course: 'Computer Engineering'
};

async function testCompleteFlow() {
  console.log('\n🎯 Step 1: Testing Merit List BEFORE adding student...');
  await testMeritList('before');
  
  console.log('\n🎯 Step 2: Submitting new student application...');
  await testApplyForm();
  
  console.log('\n🎯 Step 3: Testing Merit List AFTER adding student...');
  await testMeritList('after');
  
  console.log('\n🎯 Step 4: Testing Students endpoint...');
  await testStudentsEndpoint();
  
  process.exit(0);
}

function testApplyForm() {
  return new Promise((resolve, reject) => {
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
    
    console.log('📝 Submitting student:', testStudent);
    
    const req = http.request(options, (res) => {
      console.log(`📊 Apply Response Status: ${res.statusCode}`);
      
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          
          if (result.ok) {
            console.log('✅ Student application successful!');
            console.log('- Application ID:', result.id);
            console.log('- Student Name:', result.student?.name || 'Not returned');
            console.log('- Student Marks:', result.student?.marks || 'Not returned');
            console.log('- Student Stream:', result.student?.stream || 'Not returned');
            console.log('- Message:', result.message);
          } else {
            console.log('❌ Application failed:', result.error);
          }
          resolve(result);
        } catch (e) {
          console.log('❌ Parse error:', e.message);
          console.log('Raw response:', data);
          reject(e);
        }
      });
    });
    
    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

function testMeritList(phase) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: '/merit',
      method: 'GET'
    };
    
    const req = http.request(options, (res) => {
      console.log(`📊 Merit Response Status: ${res.statusCode}`);
      
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const merit = JSON.parse(data);
          
          console.log(`📋 Merit List (${phase}):`);
          console.log('- Science students:', merit.Science?.length || 0);
          console.log('- Arts students:', merit.Arts?.length || 0);
          console.log('- Commerce students:', merit.Commerce?.length || 0);
          
          if (merit.Science && merit.Science.length > 0) {
            console.log('\n🥇 Top 3 Science students:');
            merit.Science.slice(0, 3).forEach((student, index) => {
              console.log(`  ${index + 1}. ${student.name} - ${student.marks}% (${student.preferredCourse || student.course})`);
            });
          }
          
          // Look for our test student specifically
          if (phase === 'after') {
            const foundStudent = merit.Science?.find(s => s.email === testStudent.email);
            if (foundStudent) {
              console.log(`\n🎯 Our test student found in merit list!`);
              console.log(`   Rank: ${foundStudent.rank} | Marks: ${foundStudent.marks}%`);
            } else {
              console.log(`\n❌ Test student NOT found in merit list!`);
            }
          }
          
          resolve(merit);
        } catch (e) {
          console.log('❌ Merit parse error:', e.message);
          reject(e);
        }
      });
    });
    
    req.on('error', reject);
    req.end();
  });
}

function testStudentsEndpoint() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: '/students',
      method: 'GET'
    };
    
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const students = JSON.parse(data);
          console.log(`📊 Total students in database: ${students.length}`);
          
          const testStudentInDb = students.find(s => s.email === testStudent.email);
          if (testStudentInDb) {
            console.log('✅ Test student found in database!');
          } else {
            console.log('❌ Test student NOT found in database!');
          }
          
          resolve(students);
        } catch (e) {
          console.log('❌ Students parse error:', e.message);
          reject(e);
        }
      });
    });
    
    req.on('error', reject);
    req.end();
  });
}

// Start the test
testCompleteFlow();