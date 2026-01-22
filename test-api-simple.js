import fetch from 'node-fetch';

async function testAPI() {
    try {
        console.log('🧪 Testing merit API endpoint...');
        
        const response = await fetch('http://localhost:5000/api/merit');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('✅ API Response:', data);
        console.log(`📊 Number of students: ${data.length}`);
        
    } catch (error) {
        console.error('❌ Error testing API:', error.message);
    }
}

testAPI();