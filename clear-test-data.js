import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
dotenv.config();

const uri = 'mongodb+srv://patilteju0409_db_user:Pranavteju%401431@cluster0.ahuv2zd.mongodb.net/careerpath';

async function clearTestData() {
  try {
    const client = new MongoClient(uri);
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db('careerpath');
    const students = db.collection('students');
    
    // Count current students
    const currentCount = await students.countDocuments();
    console.log(`📊 Current students in database: ${currentCount}`);
    
    // Clear all student data (test data)
    const deleteResult = await students.deleteMany({});
    console.log(`🗑️ Removed ${deleteResult.deletedCount} student records`);
    
    // Verify database is empty
    const remainingCount = await students.countDocuments();
    console.log(`📊 Remaining students: ${remainingCount}`);
    
    await client.close();
    console.log('✅ Test data cleared successfully');
    console.log('🎯 Merit list will now show empty state');
    
  } catch (error) {
    console.error('❌ Error clearing test data:', error);
  }
}

clearTestData();