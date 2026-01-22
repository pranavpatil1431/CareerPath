import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
dotenv.config();

const uri = 'mongodb+srv://patilteju0409_db_user:Pranavteju%401431@cluster0.ahuv2zd.mongodb.net/careerpath';

async function addSampleData() {
  const client = new MongoClient(uri);
  await client.connect();
  console.log('✅ Connected to MongoDB');
  
  const db = client.db('careerpath');
  const students = db.collection('students');
  
  // Clear existing data
  await students.deleteMany({});
  console.log('🗑️ Cleared existing data');
  
  // Generate 100 test students for comprehensive testing
  const firstNames = [
    'Aarav', 'Vivaan', 'Aditya', 'Vihaan', 'Arjun', 'Sai', 'Reyansh', 'Ayaan', 'Krishna', 'Ishaan',
    'Shaurya', 'Atharv', 'Advik', 'Pranav', 'Vivek', 'Muhammed', 'Saksham', 'Ritvik', 'Rudra', 'Arnav',
    'Anaya', 'Fatima', 'Aadhya', 'Zara', 'Anvi', 'Avni', 'Angel', 'Pari', 'Kavya', 'Kiara',
    'Myra', 'Anika', 'Saanvi', 'Priya', 'Khushi', 'Alisha', 'Shanaya', 'Palak', 'Anushka', 'Riya',
    'Rajesh', 'Suresh', 'Ramesh', 'Mahesh', 'Prakash', 'Ashish', 'Deepak', 'Rakesh', 'Sanjay', 'Vijay'
  ];
  
  const lastNames = [
    'Sharma', 'Verma', 'Singh', 'Kumar', 'Gupta', 'Agarwal', 'Joshi', 'Bansal', 'Mittal', 'Sinha',
    'Patel', 'Shah', 'Mehta', 'Desai', 'Modi', 'Jain', 'Thakkar', 'Pandya', 'Parekh', 'Gandhi',
    'Reddy', 'Rao', 'Krishna', 'Prasad', 'Chandra', 'Ravi', 'Sai', 'Venkat', 'Pradeep', 'Sunil',
    'Khan', 'Ahmed', 'Ali', 'Hassan', 'Hussain', 'Malik', 'Sheikh', 'Ansari', 'Qureshi', 'Siddiqui',
    'Nair', 'Menon', 'Pillai', 'Krishnan', 'Unni', 'Thampi', 'Warrier', 'Panicker', 'Kamath', 'Bhat'
  ];

  const streams = ['Science', 'Commerce', 'Arts'];
  const courses = {
    'Science': ['B.Tech Computer Science', 'B.Tech Mechanical', 'B.Tech Civil', 'B.Tech Electrical', 'MBBS', 'BDS', 'B.Pharmacy', 'B.Sc'],
    'Commerce': ['B.Com', 'BBA', 'B.Com Honours', 'Economics Honours', 'Chartered Accountancy', 'Company Secretary'],
    'Arts': ['BA', 'B.A. English', 'B.A. History', 'B.A. Psychology', 'B.A. Political Science', 'Journalism', 'Mass Communication']
  };
  
  const cities = ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune', 'Ahmedabad', 'Jaipur', 'Lucknow'];
  const states = ['Maharashtra', 'Delhi', 'Karnataka', 'Telangana', 'Tamil Nadu', 'West Bengal', 'Maharashtra', 'Gujarat', 'Rajasthan', 'Uttar Pradesh'];

  function generateRandomStudent(index) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const name = `${firstName} ${lastName}`;
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${index}@example.com`;
    
    const stream = streams[Math.floor(Math.random() * streams.length)];
    const streamCourses = courses[stream];
    const preferredCourse = streamCourses[Math.floor(Math.random() * streamCourses.length)];
    const alternativeCourse = streamCourses[Math.floor(Math.random() * streamCourses.length)];
    
    let marksRange;
    if (stream === 'Science') {
      marksRange = [65, 98]; // Science students typically have good marks
    } else if (stream === 'Commerce') {
      marksRange = [60, 95]; // Commerce students
    } else {
      marksRange = [55, 92]; // Arts students
    }
    
    const marks = Math.floor(Math.random() * (marksRange[1] - marksRange[0] + 1)) + marksRange[0];
    
    // Generate random date of birth (18-20 years old)
    const today = new Date();
    const birthYear = today.getFullYear() - 18 - Math.floor(Math.random() * 3);
    const birthMonth = Math.floor(Math.random() * 12);
    const birthDay = Math.floor(Math.random() * 28) + 1;
    const dateOfBirth = new Date(birthYear, birthMonth, birthDay);
    
    // Generate phone number
    const phone = `+91 ${Math.floor(Math.random() * 9000000000) + 1000000000}`;
    
    // Generate address
    const cityIndex = Math.floor(Math.random() * cities.length);
    const address = `${Math.floor(Math.random() * 999) + 1}, ${lastName} Street, ${cities[cityIndex]}, ${states[cityIndex]} - ${Math.floor(Math.random() * 900000) + 100000}`;
    
    return {
      applicationId: `APP${String(index).padStart(3, '0')}`,
      name,
      email,
      phone,
      dateOfBirth,
      marks,
      stream,
      preferredCourse,
      alternativeCourse,
      address,
      createdAt: new Date(Date.now() - Math.random() * 7776000000) // Random date within last 90 days
    };
  }

  const sampleStudents = [];
  
  // Generate 100 students
  for (let i = 1; i <= 100; i++) {
    sampleStudents.push(generateRandomStudent(i));
  }
  
  const result = await students.insertMany(sampleStudents);
  console.log(`📊 Inserted ${result.insertedCount} student records`);
  
  // Verify data
  const count = await students.countDocuments();
  console.log(`👥 Total students in database: ${count}`);
  
  // Show breakdown by stream
  const scienceCount = await students.countDocuments({ stream: 'Science' });
  const commerceCount = await students.countDocuments({ stream: 'Commerce' });
  const artsCount = await students.countDocuments({ stream: 'Arts' });
  
  console.log('📈 Stream-wise breakdown:');
  console.log(`   🔬 Science: ${scienceCount} students`);
  console.log(`   💼 Commerce: ${commerceCount} students`);
  console.log(`   🎨 Arts: ${artsCount} students`);
  
  await client.close();
  console.log('🎉 Database populated with comprehensive sample data');
}

addSampleData().catch(console.error);