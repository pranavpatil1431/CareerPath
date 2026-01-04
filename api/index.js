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
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/careerpath";

// For testing merit list, force internal data usage
const FORCE_INTERNAL_DATA = process.env.NODE_ENV === 'production' ? false : false; // Set to true to test with internal data

// Database connection function
const connectDB = async () => {
  if (FORCE_INTERNAL_DATA) {
    console.log("🔧 FORCE_INTERNAL_DATA enabled - using fallback data");
    mongoConnected = false;
    return;
  }
  
  try {
    await mongoose.connect(MONGO_URI);
    
    // Wait for connection to be fully established
    await mongoose.connection.asPromise();
    
    console.log("✅ Connected to MongoDB Atlas");
    
    // Check connection details
    if (mongoose.connection?.name) {
      console.log("Connected to DB:", mongoose.connection.name);
    }
    
    if (mongoose.connection.db) {
      console.log(`🎯 Database: ${mongoose.connection.db.databaseName}`);
      console.log(`🌍 Host: ${mongoose.connection.host}`);
    } else {
      console.log("⚠️ Connection established but database info not available yet");
    }
    
    mongoConnected = true;
    Student = mongoose.model('Student', studentSchema);
    
    // Test the connection by counting documents
    try {
      const count = await Student.countDocuments();
      console.log(`📊 Current students in database: ${count}`);
    } catch (countError) {
      console.log(`⚠️ Could not count documents: ${countError.message}`);
    }
    
  } catch (error) {
    console.error("❌ MongoDB connection error:", error.message);
    console.log('💾 Falling back to in-memory storage');
    mongoConnected = false;
  }
};

// Student Schema with enhanced validation
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

// Add index for better performance
studentSchema.index({ email: 1 });
studentSchema.index({ marks: -1 });
studentSchema.index({ createdAt: -1 });

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

// Initialize database connection
const initializeDatabase = async () => {
  await connectDB();
};

// Start the connection process
initializeDatabase();

// Connection event handlers
mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB connection error:', err.message);
  mongoConnected = false;
});

mongoose.connection.on('disconnected', () => {
  console.log('📡 MongoDB disconnected');
  mongoConnected = false;
});

// Graceful shutdown
process.on('SIGINT', async () => {
  try {
    await mongoose.connection.close();
    console.log('👋 MongoDB connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during shutdown:', error.message);
    process.exit(1);
  }
});

// ✅ Enhanced Routes for Production Monitoring

// Health Check Route
app.get("/health", async (req, res) => {
  const healthStatus = {
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    environment: process.env.NODE_ENV || 'development',
    mongodb: {
      connected: mongoConnected,
      readyState: mongoose.connection.readyState,
      host: mongoose.connection.host || 'Not connected',
      database: mongoose.connection.db?.databaseName || 'Not connected'
    }
  };

  if (mongoConnected) {
    try {
      // Test database connectivity
      const studentCount = await Student.countDocuments();
      healthStatus.mongodb.studentCount = studentCount;
      healthStatus.mongodb.lastCheck = new Date().toISOString();
    } catch (error) {
      healthStatus.mongodb.error = error.message;
      healthStatus.status = "degraded";
    }
  }

  res.status(mongoConnected ? 200 : 503).json(healthStatus);
});

// Root Route
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, '../public', 'index.html'));
});

// Enhanced API Status Route
app.get("/api", async (req, res) => {
  const apiStatus = {
    message: "🎓 CareerPath API is running!",
    version: "2.0.0",
    status: "active",
    mongodb: {
      connected: mongoConnected,
      mode: mongoConnected ? "Database" : "Fallback (In-Memory)",
      connection: mongoConnected ? "MongoDB Atlas" : "Local Storage"
    },
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    uptime: `${Math.floor(process.uptime())} seconds`
  };

  if (mongoConnected) {
    try {
      const studentCount = await Student.countDocuments();
      apiStatus.mongodb.studentCount = studentCount;
    } catch (error) {
      apiStatus.mongodb.error = "Failed to fetch student count";
    }
  } else {
    apiStatus.mongodb.fallbackCount = students.length;
  }

  res.json(apiStatus);
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
    
    console.log('🏆 Merit list request received');
    console.log('🔗 MongoDB connected:', mongoConnected);
    
    if (mongoConnected && Student) {
      console.log('📊 Fetching from MongoDB Atlas...');
      // Get all students from MongoDB
      allStudents = await Student.find().sort({ marks: -1 });
      console.log(`📋 Found ${allStudents.length} students in MongoDB`);
    } else {
      console.log('💾 Using internal fallback data...');
      // Use in-memory students
      allStudents = [...students];
      console.log(`📋 Using ${allStudents.length} internal students`);
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
      console.log(`👤 Processing: ${student.name} (${stream} - ${student.marks}%)`);
      
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
      } else {
        console.log(`⚠️ Unknown stream found: "${stream}" for student: ${student.name}`);
        // Add to Science as fallback
        meritByStream.Science.push({
          _id: student._id,
          name: student.name,
          email: student.email,
          marks: student.marks,
          preferredCourse: student.course,
          stream: 'Science',
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

    console.log('🎯 Merit data being sent:', {
      Science: meritByStream.Science.length,
      Arts: meritByStream.Arts.length,
      Commerce: meritByStream.Commerce.length,
      total: allStudents.length
    });
    
    // Log top student from each stream
    if (meritByStream.Science.length > 0) {
      console.log(`🥇 Top Science: ${meritByStream.Science[0].name} (${meritByStream.Science[0].marks}%)`);
    }
    if (meritByStream.Arts.length > 0) {
      console.log(`🥇 Top Arts: ${meritByStream.Arts[0].name} (${meritByStream.Arts[0].marks}%)`);
    }
    if (meritByStream.Commerce.length > 0) {
      console.log(`🥇 Top Commerce: ${meritByStream.Commerce[0].name} (${meritByStream.Commerce[0].marks}%)`);
    }
    
    // Return direct format for frontend compatibility
    res.json(meritByStream);
  } catch (error) {
    console.error("❌ Error fetching merit list:", error);
    res.status(500).json({ 
      error: "Failed to fetch merit list",
      message: error.message
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
// Start the connection
connectDB();

// Export for Vercel
export default app;