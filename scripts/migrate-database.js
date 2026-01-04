// Database Migration Script - Populate Online Database
import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/careerpath";

// Student Schema (same as in your API)
const studentSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  email: { 
    type: String, 
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    maxlength: [100, 'Email cannot exceed 100 characters']
  },
  marks: { 
    type: Number, 
    required: [true, 'Marks are required'],
    min: [0, 'Marks cannot be negative'],
    max: [100, 'Marks cannot exceed 100']
  },
  stream: { 
    type: String, 
    default: '',
    trim: true,
    maxlength: [50, 'Stream cannot exceed 50 characters']
  },
  course: { 
    type: String, 
    default: '',
    trim: true,
    maxlength: [100, 'Course cannot exceed 100 characters']
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Sample data to populate
const sampleStudents = [
  { name: 'Patil Pranav Maruti', email: 'pranav@example.com', marks: 99, stream: 'Science', course: 'Computer Science' },
  { name: 'Tejashree Sangram Patil', email: 'tejashree@example.com', marks: 99, stream: 'Science', course: 'Engineering' },
  { name: 'Alice Johnson', email: 'alice@example.com', marks: 92, stream: 'Science', course: 'Computer Science' },
  { name: 'Bob Smith', email: 'bob@example.com', marks: 88, stream: 'Arts', course: 'English Literature' },
  { name: 'Carol Davis', email: 'carol@example.com', marks: 90, stream: 'Commerce', course: 'Business Administration' },
  { name: 'Anu Patil', email: 'anu@example.com', marks: 98, stream: 'Arts', course: 'BE' },
  { name: 'Shekhar Jadhav', email: 'shekhar@example.com', marks: 91, stream: 'Commerce', course: 'BBA' },
  { name: 'Test Student', email: 'test@example.com', marks: 85, stream: 'Science', course: 'Computer Science' },
  { name: 'Anushka Mane', email: 'anushka@example.com', marks: 85, stream: 'Science', course: 'BCA' },
  { name: 'Tanu Khot', email: 'tanu@example.com', marks: 50, stream: 'Science', course: 'Engineering' },
  { name: 'Yash Mane', email: 'yash@example.com', marks: 35, stream: 'Science', course: 'BCA' },
  { name: 'Isha Kadam', email: 'isha@example.com', marks: 64, stream: 'Arts', course: 'BE' }
];

async function migrateData() {
  try {
    console.log('🌐 Connecting to MongoDB Atlas...');
    
    await mongoose.connect(MONGO_URI);
    
    console.log('✅ Connected to MongoDB Atlas successfully!');
    console.log(`🎯 Database: ${mongoose.connection.db.databaseName}`);
    console.log(`🌍 Host: ${mongoose.connection.host}`);
    
    const Student = mongoose.model('Student', studentSchema);
    
    // Check if data already exists
    const existingCount = await Student.countDocuments();
    console.log(`📊 Existing students in database: ${existingCount}`);
    
    if (existingCount > 0) {
      console.log('⚠️ Database already contains data. Skipping migration.');
      console.log('💡 To reset data, delete all documents manually or use a different database.');
    } else {
      console.log('📝 Populating database with sample data...');
      
      for (const studentData of sampleStudents) {
        try {
          const student = new Student(studentData);
          await student.save();
          console.log(`✅ Added: ${studentData.name} (${studentData.marks}% - ${studentData.course})`);
        } catch (error) {
          console.log(`❌ Failed to add ${studentData.name}: ${error.message}`);
        }
      }
      
      const finalCount = await Student.countDocuments();
      console.log(`🎉 Migration completed! Total students: ${finalCount}`);
    }
    
    // Create indexes for better performance
    console.log('🔍 Creating database indexes...');
    await Student.createIndexes();
    console.log('✅ Indexes created successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    
    // Provide specific error guidance
    if (error.code === 8000) {
      console.error('🔐 Authentication failed - check your username/password in .env file');
    } else if (error.code === 6) {
      console.error('🌐 Network error - check your internet connection');
    } else if (error.message.includes('ENOTFOUND')) {
      console.error('🔗 DNS resolution failed - check your MongoDB Atlas connection string');
    }
    
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('👋 Database connection closed');
    process.exit(0);
  }
}

// Run migration
console.log('🚀 Starting database migration...');
console.log(`📍 Target: ${MONGO_URI.replace(/\/\/.*:.*@/, '//***:***@')}`);
migrateData();