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
  
  // Add comprehensive sample data
  const sampleStudents = [
    // Science Stream Students - High Performers
    { name: 'Divya Shah', email: 'divya@example.com', stream: 'Science', marks: 96, subjects: ['Physics', 'Chemistry', 'Mathematics'], submittedAt: new Date() },
    { name: 'Raj Sharma', email: 'raj@example.com', stream: 'Science', marks: 95, subjects: ['Physics', 'Chemistry', 'Mathematics'], submittedAt: new Date() },
    { name: 'Priya Patel', email: 'priya@example.com', stream: 'Science', marks: 92, subjects: ['Physics', 'Chemistry', 'Biology'], submittedAt: new Date() },
    { name: 'Arjun Kumar', email: 'arjun@example.com', stream: 'Science', marks: 89, subjects: ['Physics', 'Chemistry', 'Mathematics'], submittedAt: new Date() },
    { name: 'Sneha Singh', email: 'sneha@example.com', stream: 'Science', marks: 87, subjects: ['Physics', 'Chemistry', 'Biology'], submittedAt: new Date() },
    { name: 'Vikram Joshi', email: 'vikram@example.com', stream: 'Science', marks: 84, subjects: ['Physics', 'Mathematics', 'Computer Science'], submittedAt: new Date() },
    
    // Commerce Stream Students
    { name: 'Harsh Agarwal', email: 'harsh@example.com', stream: 'Commerce', marks: 93, subjects: ['Accounting', 'Economics', 'Business Studies'], submittedAt: new Date() },
    { name: 'Anita Desai', email: 'anita@example.com', stream: 'Commerce', marks: 91, subjects: ['Accounting', 'Economics', 'Business Studies'], submittedAt: new Date() },
    { name: 'Rohit Gupta', email: 'rohit@example.com', stream: 'Commerce', marks: 88, subjects: ['Accounting', 'Economics', 'Mathematics'], submittedAt: new Date() },
    { name: 'Kavya Nair', email: 'kavya@example.com', stream: 'Commerce', marks: 85, subjects: ['Accounting', 'Business Studies', 'English'], submittedAt: new Date() },
    { name: 'Amit Rao', email: 'amit@example.com', stream: 'Commerce', marks: 82, subjects: ['Economics', 'Business Studies', 'Statistics'], submittedAt: new Date() },
    
    // Arts Stream Students
    { name: 'Isha Reddy', email: 'isha@example.com', stream: 'Arts', marks: 88, subjects: ['History', 'Political Science', 'Psychology'], submittedAt: new Date() },
    { name: 'Meera Iyer', email: 'meera@example.com', stream: 'Arts', marks: 86, subjects: ['History', 'Political Science', 'English Literature'], submittedAt: new Date() },
    { name: 'Karan Sharma', email: 'karan@example.com', stream: 'Arts', marks: 83, subjects: ['Psychology', 'Sociology', 'English Literature'], submittedAt: new Date() },
    { name: 'Pooja Mishra', email: 'pooja@example.com', stream: 'Arts', marks: 80, subjects: ['History', 'Geography', 'Political Science'], submittedAt: new Date() },
    { name: 'Rahul Verma', email: 'rahul@example.com', stream: 'Arts', marks: 78, subjects: ['Philosophy', 'Psychology', 'English Literature'], submittedAt: new Date() },

    // Additional students to make it comprehensive
    { name: 'Nisha Gupta', email: 'nisha@example.com', stream: 'Science', marks: 90, subjects: ['Physics', 'Chemistry', 'Biology'], submittedAt: new Date() },
    { name: 'Manish Singh', email: 'manish@example.com', stream: 'Commerce', marks: 86, subjects: ['Accounting', 'Economics', 'Statistics'], submittedAt: new Date() },
    { name: 'Ritu Bansal', email: 'ritu@example.com', stream: 'Arts', marks: 81, subjects: ['Sociology', 'Psychology', 'English Literature'], submittedAt: new Date() },
    { name: 'Deepak Kumar', email: 'deepak@example.com', stream: 'Science', marks: 88, subjects: ['Physics', 'Mathematics', 'Computer Science'], submittedAt: new Date() },
    { name: 'Sonal Jain', email: 'sonal@example.com', stream: 'Commerce', marks: 84, subjects: ['Business Studies', 'Economics', 'English'], submittedAt: new Date() }
  ];
  
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