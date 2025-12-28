import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import bodyParser from "body-parser";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(bodyParser.json());

// ✅ Serve static files from public directory
app.use(express.static(path.join(__dirname, '../public')));

// ✅ MongoDB Configuration
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/careerpath";

// Student Schema
const studentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  marks: { type: Number, required: true },
  stream: { type: String, default: '' },
  course: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

let Student;
let mongoConnected = false;

// In-memory storage as fallback
let students = [
  { _id: '1', name: 'Patil Pranav Maruti', email: 'pranav@example.com', marks: 99, stream: 'Science', course: 'Computer Science', createdAt: new Date() },
  { _id: '2', name: 'tejashree sangram patil', email: 'tejashree@example.com', marks: 99, stream: 'Science', course: 'Engineering', createdAt: new Date() },
  { _id: '3', name: 'Alice Johnson', email: 'alice@example.com', marks: 92, stream: 'Science', course: 'Computer Science', createdAt: new Date() },
  { _id: '4', name: 'Bob Smith', email: 'bob@example.com', marks: 88, stream: 'Arts', course: 'English Literature', createdAt: new Date() },
  { _id: '5', name: 'Carol Davis', email: 'carol@example.com', marks: 90, stream: 'Commerce', course: 'Business Administration', createdAt: new Date() },
  { _id: '6', name: 'anu patil', email: 'anu@example.com', marks: 98, stream: 'Arts', course: 'BE', createdAt: new Date() },
  { _id: '7', name: 'shekhar jadhav', email: 'shekhar@example.com', marks: 91, stream: 'Commerce', course: 'BBA', createdAt: new Date() },
  { _id: '8', name: 'Test Student', email: 'test@example.com', marks: 85, stream: 'Science', course: 'Computer Science', createdAt: new Date() },
  { _id: '9', name: 'Anushka mane', email: 'anushka@example.com', marks: 85, stream: 'Science', course: 'BCA', createdAt: new Date() },
  { _id: '10', name: 'tanu khot', email: 'tanu@example.com', marks: 50, stream: 'Science', course: 'Engineering', createdAt: new Date() },
  { _id: '11', name: 'Yash Mane', email: 'yash@example.com', marks: 35, stream: 'Science', course: 'BCA', createdAt: new Date() },
  { _id: '12', name: 'Isha kadam', email: 'isha@example.com', marks: 64, stream: 'Arts', course: 'BE', createdAt: new Date() }
];

// Connect to MongoDB
async function connectToMongoDB() {
  try {
    console.log('📡 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB successfully!');
    
    Student = mongoose.model('Student', studentSchema);
    mongoConnected = true;
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    console.log('💾 Using in-memory storage as fallback');
    mongoConnected = false;
  }
}

// Initialize MongoDB connection
connectToMongoDB();

mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB connection error:', err);
  mongoConnected = false;
});

mongoose.connection.on('disconnected', () => {
  console.log('📡 MongoDB disconnected');
  mongoConnected = false;
});

// ✅ Routes
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, '../public', 'index.html'));
});

app.get("/api", (req, res) => {
  res.json({ 
    message: "CareerPath API is running!",
    mongodb: mongoConnected ? "Connected" : "Fallback mode",
    timestamp: new Date().toISOString()
  });
});

app.post("/apply", async (req, res) => {
  try {
    const { name, email, marks, stream, course } = req.body;
    
    // Validation
    if (!name || !email || !marks) {
      return res.status(400).json({ 
        ok: false, 
        error: "Name, email, and marks are required." 
      });
    }

    const studentData = {
      name: name.trim(),
      email: email.trim(),
      marks: Number(marks),
      stream: stream || '',
      course: course || '',
      createdAt: new Date()
    };

    if (mongoConnected && Student) {
      // Use MongoDB
      const newStudent = new Student(studentData);
      const savedStudent = await newStudent.save();
      
      res.status(201).json({ 
        ok: true, 
        id: savedStudent._id,
        message: "Application submitted successfully!" 
      });
    } else {
      // Use in-memory storage
      studentData._id = Date.now().toString();
      students.push(studentData);
      
      res.status(201).json({ 
        ok: true, 
        id: studentData._id,
        message: "Application submitted successfully!" 
      });
    }
  } catch (error) {
    console.error("Error saving student:", error);
    res.status(500).json({ 
      ok: false, 
      error: "Failed to submit application. Please try again." 
    });
  }
});

app.get("/students", async (req, res) => {
  try {
    if (mongoConnected && Student) {
      const allStudents = await Student.find();
      res.json(allStudents);
    } else {
      res.json(students);
    }
  } catch (error) {
    console.error("Error fetching students:", error);
    res.status(500).json({ error: "Failed to fetch students" });
  }
});

app.get("/merit", async (req, res) => {
  try {
    let allStudents;
    
    if (mongoConnected && Student) {
      // Get all students from MongoDB
      allStudents = await Student.find().sort({ marks: -1 });
    } else {
      // Use in-memory students
      allStudents = [...students];
    }

    // Group students by stream and sort by marks
    const meritByStream = {
      Science: [],
      Arts: [],
      Commerce: []
    };

    // Group students by their stream
    allStudents.forEach(student => {
      const stream = student.stream;
      if (meritByStream.hasOwnProperty(stream)) {
        meritByStream[stream].push({
          _id: student._id,
          name: student.name,
          email: student.email,
          marks: student.marks,
          preferredCourse: student.course,
          stream: stream,
          createdAt: student.createdAt
        });
      }
    });

    // Sort each stream by marks (highest first)
    Object.keys(meritByStream).forEach(stream => {
      meritByStream[stream] = meritByStream[stream]
        .sort((a, b) => b.marks - a.marks)
        .map((student, index) => ({
          ...student,
          rank: index + 1
        }));
    });

    console.log('Merit data:', {
      Science: meritByStream.Science.length,
      Arts: meritByStream.Arts.length,
      Commerce: meritByStream.Commerce.length
    });
    
    res.json({
      success: true,
      data: meritByStream
    });
  } catch (error) {
    console.error("Error fetching merit list:", error);
    res.status(500).json({ 
      success: false,
      error: "Failed to fetch merit list" 
    });
  }
});

// Admin routes
const ADMIN_CREDENTIALS = {
  username: process.env.ADMIN_USERNAME || "admin",
  password: process.env.ADMIN_PASSWORD || "admin123"
};

const adminTokens = new Set();

function generateToken() {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

app.post("/admin/login", (req, res) => {
  const { username, password } = req.body;
  
  if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
    const token = generateToken();
    adminTokens.add(token);
    
    setTimeout(() => {
      adminTokens.delete(token);
    }, 24 * 60 * 60 * 1000);
    
    res.json({ ok: true, token, message: "Login successful" });
  } else {
    res.status(401).json({ ok: false, error: "Invalid credentials" });
  }
});

function verifyAdminToken(req, res, next) {
  const token = req.headers['x-admin-token'];
  
  if (!token || !adminTokens.has(token)) {
    return res.status(401).json({ ok: false, error: "Unauthorized" });
  }
  
  next();
}

app.get("/admin/applicants", verifyAdminToken, async (req, res) => {
  try {
    let allStudents;
    
    if (mongoConnected && Student) {
      allStudents = await Student.find().sort({ marks: -1 });
    } else {
      allStudents = [...students].sort((a, b) => b.marks - a.marks);
    }
    
    const formattedStudents = allStudents.map(student => ({
      _id: student._id,
      name: student.name,
      email: student.email,
      marks: student.marks,
      stream: student.stream,
      course: student.course,
      applied_at: student.createdAt ? new Date(student.createdAt).toLocaleString() : 'N/A'
    }));
    
    res.json(formattedStudents);
  } catch (error) {
    console.error("Error fetching applicants:", error);
    res.status(500).json({ error: "Failed to fetch applicants" });
  }
});

// ✅ Start Server - Initialize MongoDB connection
connectToMongoDB();

// Export for Vercel
export default app;