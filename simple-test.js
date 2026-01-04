import fetch from 'node-fetch';

console.log('🔄 Testing API endpoints...\n');

try {
  console.log('1. Testing merit endpoint...');
  const meritResponse = await fetch('http://localhost:5000/merit');
  const meritData = await meritResponse.json();
  console.log(`✅ Merit endpoint working! Found ${meritData.length} students`);
  
  console.log('\n2. Testing form submission...');
  const testStudent = {
    name: "Test Student",
    email: "test@example.com",
    marks: 95,
    stream: "Science",
    course: "Computer Science"
  };
  
  const submitResponse = await fetch('http://localhost:5000/apply', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(testStudent)
  });
  
  const submitResult = await submitResponse.json();
  console.log('✅ Form submission result:', submitResult.message || submitResult.error);
  
} catch (error) {
  console.error('❌ Test failed:', error.message);
}