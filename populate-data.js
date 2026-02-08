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
  
  // Generate 341 test students with specific course distribution
  // 40% Engineering, 30% Medical, 10% Pharmacy, 20% Other
  const totalStudents = 341;
  const engineeringCount = 136; // 40%
  const medicalCount = 102;     // 30% 
  const pharmacyCount = 34;     // 10%
  const otherCount = 69;        // 20%
  
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

  // Specific course categories for the distribution
  const engineeringCourses = [
    'B.Tech Computer Science', 'B.Tech Mechanical', 'B.Tech Civil', 
    'B.Tech Electrical', 'B.Tech Electronics', 'B.Tech Information Technology',
    'B.Tech Automobile', 'B.Tech Chemical', 'B.Tech Aerospace'
  ];
  
  const medicalCourses = [
    'MBBS', 'BDS', 'BAMS', 'BHMS', 'B.Sc Nursing', 
    'BPT', 'BMLT', 'B.Optometry', 'B.Sc Radiology'
  ];
  
  const pharmacyCourses = [
    'B.Pharmacy', 'Pharm.D', 'B.Sc Pharmaceutical Sciences'
  ];
  
  const otherCourses = [
    'B.Com', 'BBA', 'B.Com Honours', 'Economics Honours', 'Chartered Accountancy', 
    'Company Secretary', 'BA', 'B.A. English', 'B.A. History', 'B.A. Psychology', 
    'B.A. Political Science', 'Journalism', 'Mass Communication', 'B.Sc Mathematics',
    'B.Sc Physics', 'B.Sc Chemistry', 'B.Sc Biology', 'BCA', 'B.Design'
  ];
  
  const cities = ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune', 'Ahmedabad', 'Jaipur', 'Lucknow'];
  const states = ['Maharashtra', 'Delhi', 'Karnataka', 'Telangana', 'Tamil Nadu', 'West Bengal', 'Maharashtra', 'Gujarat', 'Rajasthan', 'Uttar Pradesh'];

  function generateRandomStudent(index, courseCategory) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const name = `${firstName} ${lastName}`;
    const randomNumber = Math.floor(Math.random() * 9000) + 1000; // Random 4-digit number (1000-9999)
    const email = `${firstName.toLowerCase()}${lastName.toLowerCase()}${randomNumber}@gmail.com`;
    
    let preferredCourse, stream, marksRange;
    
    // Assign course based on category
    if (courseCategory === 'engineering') {
      preferredCourse = engineeringCourses[Math.floor(Math.random() * engineeringCourses.length)];
      stream = 'Science';
      marksRange = [75, 98]; // Engineering students typically have higher marks
    } else if (courseCategory === 'medical') {
      preferredCourse = medicalCourses[Math.floor(Math.random() * medicalCourses.length)];
      stream = 'Science';
      marksRange = [80, 98]; // Medical students need very high marks
    } else if (courseCategory === 'pharmacy') {
      preferredCourse = pharmacyCourses[Math.floor(Math.random() * pharmacyCourses.length)];
      stream = 'Science';
      marksRange = [70, 95]; // Pharmacy students need good marks
    } else {
      preferredCourse = otherCourses[Math.floor(Math.random() * otherCourses.length)];
      if (preferredCourse.includes('B.Com') || preferredCourse.includes('BBA') || preferredCourse.includes('Economics') || preferredCourse.includes('Chartered') || preferredCourse.includes('Company')) {
        stream = 'Commerce';
        marksRange = [60, 92];
      } else if (preferredCourse.includes('B.Sc') || preferredCourse.includes('BCA')) {
        stream = 'Science';
        marksRange = [65, 90];
      } else {
        stream = 'Arts';
        marksRange = [55, 88];
      }
    }
    
    const alternativeCourse = preferredCourse; // For simplicity, keeping same course
    
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
  
  // Generate students with specific distribution
  let studentIndex = 1;
  
  // Generate 136 Engineering students (40%)
  console.log('🔧 Generating Engineering students...');
  for (let i = 0; i < engineeringCount; i++) {
    sampleStudents.push(generateRandomStudent(studentIndex++, 'engineering'));
  }
  
  // Generate 102 Medical students (30%)
  console.log('🏥 Generating Medical students...');
  for (let i = 0; i < medicalCount; i++) {
    sampleStudents.push(generateRandomStudent(studentIndex++, 'medical'));
  }
  
  // Generate 34 Pharmacy students (10%)
  console.log('💊 Generating Pharmacy students...');
  for (let i = 0; i < pharmacyCount; i++) {
    sampleStudents.push(generateRandomStudent(studentIndex++, 'pharmacy'));
  }
  
  // Generate 69 Other students (20%)
  console.log('📚 Generating Other category students...');
  for (let i = 0; i < otherCount; i++) {
    sampleStudents.push(generateRandomStudent(studentIndex++, 'other'));
  }
  
  // Shuffle the array to mix students randomly
  for (let i = sampleStudents.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [sampleStudents[i], sampleStudents[j]] = [sampleStudents[j], sampleStudents[i]];
  }
  
  // Sort by marks in descending order for merit ranking
  sampleStudents.sort((a, b) => b.marks - a.marks);
  
  const result = await students.insertMany(sampleStudents);
  console.log(`📊 Inserted ${result.insertedCount} student records`);
  
  // Verify data
  const count = await students.countDocuments();
  console.log(`👥 Total students in database: ${count}`);
  
  // Show breakdown by course category
  const engineeringStudents = await students.countDocuments({ 
    preferredCourse: { $regex: 'B\.Tech|Engineering', $options: 'i' } 
  });
  const medicalStudents = await students.countDocuments({ 
    preferredCourse: { $regex: 'MBBS|BDS|BAMS|BHMS|Nursing|BPT|BMLT|Optometry|Radiology', $options: 'i' } 
  });
  const pharmacyStudents = await students.countDocuments({ 
    preferredCourse: { $regex: 'Pharmacy|Pharm\.D', $options: 'i' } 
  });
  const otherStudents = count - engineeringStudents - medicalStudents - pharmacyStudents;
  
  console.log('📈 Course category breakdown:');
  console.log(`   🔧 Engineering: ${engineeringStudents} students (${(engineeringStudents/count*100).toFixed(1)}%)`);
  console.log(`   🏥 Medical: ${medicalStudents} students (${(medicalStudents/count*100).toFixed(1)}%)`);
  console.log(`   💊 Pharmacy: ${pharmacyStudents} students (${(pharmacyStudents/count*100).toFixed(1)}%)`);
  console.log(`   📚 Other: ${otherStudents} students (${(otherStudents/count*100).toFixed(1)}%)`);
  
  console.log('🎉 Database populated with targeted course distribution');
  
  await client.close();
}

addSampleData().catch(console.error);