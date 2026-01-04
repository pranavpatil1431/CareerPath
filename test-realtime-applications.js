// Test new student application to verify real-time merit list updates
import http from 'http';

const newStudents = [
  {
    name: 'Test Student Real-time',
    email: 'realtime@test.com',
    marks: 95,
    stream: 'Science',
    course: 'Computer Science'
  },
  {
    name: 'Another Test Student',
    email: 'another@test.com',
    marks: 87,
    stream: 'Arts',
    course: 'Psychology'
  }
];

async function submitApplication(studentData) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(studentData);

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

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          resolve({ status: res.statusCode, data: result });
        } catch (error) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

async function testRealTimeApplications() {
  console.log('🧪 Testing real-time merit list updates...\n');

  for (let i = 0; i < newStudents.length; i++) {
    const student = newStudents[i];
    console.log(`📝 Submitting application ${i + 1}/${newStudents.length}:`);
    console.log(`   Name: ${student.name}`);
    console.log(`   Marks: ${student.marks}%`);
    console.log(`   Stream: ${student.stream}`);

    try {
      const result = await submitApplication(student);
      
      if (result.status === 201 && result.data.ok) {
        console.log(`✅ Application successful! ID: ${result.data.id}`);
        console.log(`   ${result.data.message}\n`);
      } else {
        console.log(`❌ Application failed: ${result.data.error || 'Unknown error'}\n`);
      }
    } catch (error) {
      console.log(`❌ Network error: ${error.message}\n`);
    }

    // Wait 2 seconds between applications
    if (i < newStudents.length - 1) {
      console.log('⏳ Waiting 2 seconds before next application...\n');
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  console.log('🎯 Test completed! Check the merit list to see real-time updates:');
  console.log('   👉 http://localhost:5000/merit.html');
}

testRealTimeApplications();