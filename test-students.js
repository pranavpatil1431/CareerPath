// Quick test to check database students
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/careerpath";

const studentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  marks: { type: Number, required: true },
  stream: { type: String, default: '' },
  course: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

async function checkData() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to database');
    
    const Student = mongoose.model('Student', studentSchema);
    const students = await Student.find().sort({ marks: -1 });
    
    console.log(`📊 Found ${students.length} students:`);
    students.forEach(s => {
      console.log(`- ${s.name}: ${s.marks}% (Stream: "${s.stream}" - Course: "${s.course}")`);
    });
    
    // Group by stream
    const byStream = students.reduce((acc, s) => {
      const stream = s.stream || 'Unknown';
      if (!acc[stream]) acc[stream] = [];
      acc[stream].push(s);
      return acc;
    }, {});
    
    console.log('\n📋 Students by stream:');
    Object.keys(byStream).forEach(stream => {
      console.log(`${stream}: ${byStream[stream].length} students`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

checkData();