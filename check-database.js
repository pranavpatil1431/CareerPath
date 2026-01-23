import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
dotenv.config();

const uri = 'mongodb+srv://patilteju0409_db_user:Pranavteju%401431@cluster0.ahuv2zd.mongodb.net/careerpath';

async function checkDatabase() {
  try {
    const client = new MongoClient(uri);
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db('careerpath');
    const students = db.collection('students');
    
    // Count current students
    const count = await students.countDocuments();
    console.log(`📊 Current students in database: ${count}`);
    
    if (count > 0) {
      console.log('📋 First few students:');
      const sampleStudents = await students.find().limit(3).toArray();
      sampleStudents.forEach((student, index) => {
        console.log(`  ${index + 1}. ${student.name} - ${student.marks}% (${student.stream})`);
      });
    } else {
      console.log('✅ Database is empty - no students found');
    }
    
    await client.close();
    
  } catch (error) {
    console.error('❌ Error checking database:', error);
  }
}

checkDatabase();