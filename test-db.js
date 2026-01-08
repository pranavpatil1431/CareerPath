import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const mongoURI = "mongodb+srv://patilteju0409_db_user:Pranavteju%401431@cluster0.ahuv2zd.mongodb.net/careerpath";

// Student Schema matching the one in server.js
const studentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  marks: { type: Number, required: true },
  stream: { type: String, required: true },
  subjects: [String],
  submittedAt: { type: Date, default: Date.now }
});

const Student = mongoose.model("Student", studentSchema);

async function testDatabase() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB');
    
    // Count all documents
    const count = await Student.countDocuments();
    console.log(`📊 Total students found: ${count}`);
    
    // Find all students
    const students = await Student.find({}).limit(5);
    console.log('👥 First 5 students:', students.map(s => `${s.name} - ${s.stream} - ${s.marks}%`));
    
    // Check collection names
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('📁 Available collections:', collections.map(c => c.name));
    
    await mongoose.disconnect();
    console.log('✅ Test completed');
  } catch (error) {
    console.error('❌ Test error:', error);
  }
}

testDatabase();