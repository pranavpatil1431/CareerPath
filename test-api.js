// Test form submission
console.log('Testing form submission...');

async function testFormSubmission() {
    const testData = {
        name: "Test Student",
        email: "test@example.com",
        marks: 85,
        stream: "Science",
        course: "Computer Science"
    };

    try {
        const response = await fetch('http://localhost:5000/apply', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(testData)
        });

        const result = await response.json();
        console.log('Form submission result:', result);
        
        if (result.ok) {
            console.log('✅ Form submission successful!');
            console.log('Application ID:', result.id);
        } else {
            console.log('❌ Form submission failed:', result.error);
        }
    } catch (error) {
        console.error('❌ Error during form submission:', error);
    }
}

// Test merit list
async function testMeritList() {
    try {
        const response = await fetch('http://localhost:5000/merit');
        const meritList = await response.json();
        console.log('Merit list:', meritList);
        console.log('✅ Merit list retrieved successfully!');
        console.log('Number of applicants:', meritList.length);
    } catch (error) {
        console.error('❌ Error retrieving merit list:', error);
    }
}

// Test admin login
async function testAdminLogin() {
    const loginData = {
        username: "admin",
        password: "admin123"
    };

    try {
        const response = await fetch('http://localhost:5000/admin/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(loginData)
        });

        const result = await response.json();
        console.log('Admin login result:', result);
        
        if (result.ok) {
            console.log('✅ Admin login successful!');
            console.log('Token:', result.token);
            return result.token;
        } else {
            console.log('❌ Admin login failed:', result.error);
        }
    } catch (error) {
        console.error('❌ Error during admin login:', error);
    }
}

// Run tests
testFormSubmission();
testMeritList();
testAdminLogin();