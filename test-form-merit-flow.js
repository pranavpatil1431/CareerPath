// Test script to verify form submission and merit list update
import fetch from 'node-fetch';

async function testFormSubmission() {
  console.log('🔄 Testing Form Submission to Merit List Flow...\n');
  
  // Test data for new application
  const testStudent = {
    name: "Test Student",
    email: "test.student@example.com",
    marks: 95,
    stream: "Science",
    course: "Computer Science Engineering"
  };

  try {
    console.log('1. Checking current merit list...');
    const meritBefore = await fetch('http://localhost:5000/merit');
    const meritDataBefore = await meritBefore.json();
    console.log(`   Current students count: ${meritDataBefore.length}`);
    
    console.log('\n2. Submitting new application...');
    console.log(`   Student: ${testStudent.name}`);
    console.log(`   Email: ${testStudent.email}`);
    console.log(`   Marks: ${testStudent.marks}`);
    console.log(`   Stream: ${testStudent.stream}`);
    console.log(`   Course: ${testStudent.course}`);
    
    const submitResponse = await fetch('http://localhost:5000/apply', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testStudent)
    });
    
    const submitResult = await submitResponse.json();
    console.log(`   Submission result: ${submitResult.message || submitResult.error || 'Unknown'}`);
    
    if (submitResult.student) {
      console.log(`   New student ID: ${submitResult.student._id}`);
    }
    
    console.log('\n3. Waiting for database update (2 seconds)...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log('\n4. Checking updated merit list...');
    const meritAfter = await fetch('http://localhost:5000/merit');
    const meritDataAfter = await meritAfter.json();
    console.log(`   Updated students count: ${meritDataAfter.length}`);
    
    // Check if new student appears in merit list
    const newStudent = meritDataAfter.find(s => s.email === testStudent.email);
    if (newStudent) {
      console.log('✅ SUCCESS: New student found in merit list!');
      console.log(`   Rank: ${meritDataAfter.indexOf(newStudent) + 1}`);
      console.log(`   Name: ${newStudent.name}`);
      console.log(`   Marks: ${newStudent.marks}`);
    } else {
      console.log('❌ ISSUE: New student not found in merit list!');
    }
    
    console.log('\n5. Merit List Preview (top 5):');
    meritDataAfter.slice(0, 5).forEach((student, index) => {
      console.log(`   ${index + 1}. ${student.name} - ${student.marks} marks (${student.stream})`);
    });
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testFormSubmission();