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

// Student Schema with enhanced validation and tracking
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
    unique: true,
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
    default: 'Science',
    enum: ['Science', 'Arts', 'Commerce'],
    trim: true
  },
  course: { 
    type: String, 
    default: '',
    trim: true,
    maxlength: [100, 'Course cannot exceed 100 characters']
  },
  applicationId: {
    type: String,
    unique: true,
    sparse: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Pre-save middleware to generate application ID and update timestamps
studentSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  
  if (!this.applicationId) {
    this.applicationId = 'APP' + Date.now() + Math.floor(Math.random() * 1000);
  }
  
  next();
});

// Add indexes for better performance
studentSchema.index({ email: 1 });
studentSchema.index({ marks: -1 });
studentSchema.index({ createdAt: -1 });
studentSchema.index({ stream: 1, marks: -1 });
studentSchema.index({ applicationId: 1 });

let Student;
let mongoConnected = false;

// In-memory storage as fallback with enhanced data
let students = [
  { 
    _id: '1', 
    name: 'Patil Pranav Maruti', 
    email: 'pranav@example.com', 
    marks: 99, 
    stream: 'Science', 
    course: 'Computer Science', 
    applicationId: 'APP001',
    status: 'pending',
    createdAt: new Date('2025-01-01T10:00:00Z') 
  },
  { 
    _id: '2', 
    name: 'Tejashree Sangram Patil', 
    email: 'tejashree@example.com', 
    marks: 99, 
    stream: 'Science', 
    course: 'Engineering', 
    applicationId: 'APP002',
    status: 'pending',
    createdAt: new Date('2025-01-01T11:00:00Z') 
  },
  { 
    _id: '3', 
    name: 'Alice Johnson', 
    email: 'alice@example.com', 
    marks: 92, 
    stream: 'Science', 
    course: 'Computer Science', 
    applicationId: 'APP003',
    status: 'pending',
    createdAt: new Date('2025-01-01T12:00:00Z') 
  },
  { 
    _id: '4', 
    name: 'Bob Smith', 
    email: 'bob@example.com', 
    marks: 88, 
    stream: 'Arts', 
    course: 'English Literature', 
    applicationId: 'APP004',
    status: 'pending',
    createdAt: new Date('2025-01-01T13:00:00Z') 
  },
  { 
    _id: '5', 
    name: 'Carol Davis', 
    email: 'carol@example.com', 
    marks: 90, 
    stream: 'Commerce', 
    course: 'Business Administration', 
    applicationId: 'APP005',
    status: 'pending',
    createdAt: new Date('2025-01-01T14:00:00Z') 
  },
  { 
    _id: '6', 
    name: 'Anu Patil', 
    email: 'anu@example.com', 
    marks: 98, 
    stream: 'Arts', 
    course: 'BE', 
    applicationId: 'APP006',
    status: 'pending',
    createdAt: new Date('2025-01-01T15:00:00Z') 
  },
  { 
    _id: '7', 
    name: 'Shekhar Jadhav', 
    email: 'shekhar@example.com', 
    marks: 91, 
    stream: 'Commerce', 
    course: 'BBA', 
    applicationId: 'APP007',
    status: 'pending',
    createdAt: new Date('2025-01-01T16:00:00Z') 
  },
  { 
    _id: '8', 
    name: 'Anushka Mane', 
    email: 'anushka@example.com', 
    marks: 85, 
    stream: 'Science', 
    course: 'BCA', 
    applicationId: 'APP008',
    status: 'pending',
    createdAt: new Date('2025-01-01T17:00:00Z') 
  },
  { 
    _id: '9', 
    name: 'Tanu Khot', 
    email: 'tanu@example.com', 
    marks: 76, 
    stream: 'Science', 
    course: 'Engineering', 
    applicationId: 'APP009',
    status: 'pending',
    createdAt: new Date('2025-01-01T18:00:00Z') 
  },
  { 
    _id: '10', 
    name: 'Yash Mane', 
    email: 'yash@example.com', 
    marks: 68, 
    stream: 'Science', 
    course: 'BCA', 
    applicationId: 'APP010',
    status: 'pending',
    createdAt: new Date('2025-01-01T19:00:00Z') 
  },
  { 
    _id: '11', 
    name: 'Isha Kadam', 
    email: 'isha@example.com', 
    marks: 82, 
    stream: 'Arts', 
    course: 'BE', 
    applicationId: 'APP011',
    status: 'pending',
    createdAt: new Date('2025-01-01T20:00:00Z') 
  }
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
    
    // Enhanced Validation
    if (!name || !email || marks === undefined || marks === null) {
      return res.status(400).json({ 
        ok: false, 
        error: "Name, email, and marks are required." 
      });
    }

    if (marks < 0 || marks > 100) {
      return res.status(400).json({ 
        ok: false, 
        error: "Marks must be between 0 and 100." 
      });
    }

    // Validate stream
    const validStreams = ['Science', 'Arts', 'Commerce'];
    const selectedStream = stream || 'Science';
    if (!validStreams.includes(selectedStream)) {
      return res.status(400).json({ 
        ok: false, 
        error: "Invalid stream. Must be Science, Arts, or Commerce." 
      });
    }

    // Check for duplicate email in both MongoDB and memory
    let existingStudent = null;
    
    if (mongoConnected && Student) {
      existingStudent = await Student.findOne({ email: email.toLowerCase() });
    }
    
    if (!existingStudent) {
      existingStudent = students.find(s => s.email.toLowerCase() === email.toLowerCase());
    }

    if (existingStudent) {
      return res.status(400).json({ 
        ok: false, 
        error: "A student with this email already exists." 
      });
    }

    // Generate application ID
    const applicationId = 'APP' + Date.now() + Math.floor(Math.random() * 1000);

    const studentData = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      marks: Number(marks),
      stream: selectedStream,
      course: course || '',
      applicationId: applicationId,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    let savedStudentId;

    if (mongoConnected && Student) {
      try {
        // Save to MongoDB
        const newStudent = new Student(studentData);
        const savedStudent = await newStudent.save();
        savedStudentId = savedStudent._id;
        
        // Also add to in-memory for immediate merit list updates
        const memoryStudent = {
          ...studentData,
          _id: savedStudent._id.toString()
        };
        students.push(memoryStudent);
        
        console.log(`✅ Student saved to MongoDB: ${studentData.name} (ID: ${savedStudent._id})`);
        
      } catch (mongoError) {
        console.error('❌ MongoDB save error:', mongoError);
        // Fall back to in-memory storage
        savedStudentId = Date.now().toString();
        studentData._id = savedStudentId;
        students.push(studentData);
      }
    } else {
      // Use only in-memory storage
      savedStudentId = Date.now().toString();
      studentData._id = savedStudentId;
      students.push(studentData);
    }

    console.log(`✅ New student added: ${studentData.name} (${studentData.marks}% - ${studentData.stream})`);
    console.log(`📊 Total students now: ${students.length}`);
    
    res.status(201).json({ 
      ok: true, 
      id: savedStudentId,
      applicationId: applicationId,
      message: "🎉 Application submitted successfully! Check the merit list to see your ranking.",
      student: {
        name: studentData.name,
        email: studentData.email,
        marks: studentData.marks,
        stream: studentData.stream,
        course: studentData.course,
        applicationId: applicationId
      }
    });
  } catch (error) {
    console.error("❌ Error saving student:", error);
    res.status(500).json({ 
      ok: false, 
      error: "Failed to submit application. Please try again." 
    });
  }
});

// Get student rank by email
app.get("/student-rank/:email", async (req, res) => {
  try {
    const { email } = req.params;
    
    if (!email) {
      return res.status(400).json({
        ok: false,
        error: "Email is required"
      });
    }

    let allStudents;
    
    if (mongoConnected && Student) {
      allStudents = await Student.find({ status: 'pending' }).sort({ marks: -1, createdAt: 1 });
    } else {
      allStudents = students.filter(s => !s.status || s.status === 'pending');
    }

    // Find student by email
    const student = allStudents.find(s => s.email.toLowerCase() === email.toLowerCase());
    
    if (!student) {
      return res.status(404).json({
        ok: false,
        error: "Student not found"
      });
    }

    // Calculate overall rank
    const sortedStudents = allStudents.sort((a, b) => {
      if (b.marks !== a.marks) {
        return b.marks - a.marks;
      }
      return new Date(a.createdAt) - new Date(b.createdAt);
    });

    const overallRank = sortedStudents.findIndex(s => s.email === student.email) + 1;

    // Calculate stream rank
    const streamStudents = allStudents.filter(s => s.stream === student.stream);
    const sortedStreamStudents = streamStudents.sort((a, b) => {
      if (b.marks !== a.marks) {
        return b.marks - a.marks;
      }
      return new Date(a.createdAt) - new Date(b.createdAt);
    });

    const streamRank = sortedStreamStudents.findIndex(s => s.email === student.email) + 1;

    res.json({
      ok: true,
      student: {
        name: student.name,
        email: student.email,
        marks: student.marks,
        stream: student.stream,
        course: student.course,
        applicationId: student.applicationId
      },
      rankings: {
        overall: overallRank,
        stream: streamRank,
        totalStudents: allStudents.length,
        streamTotal: streamStudents.length
      }
    });

  } catch (error) {
    console.error("❌ Error getting student rank:", error);
    res.status(500).json({
      ok: false,
      error: "Failed to get student rank"
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
      try {
        // Get all students from MongoDB, only pending applications
        allStudents = await Student.find({ status: 'pending' }).sort({ marks: -1, createdAt: 1 });
        console.log(`📋 Found ${allStudents.length} students in MongoDB`);
        
        // Sync memory storage with MongoDB
        if (allStudents.length > 0) {
          students = allStudents.map(student => ({
            _id: student._id.toString(),
            name: student.name,
            email: student.email,
            marks: student.marks,
            stream: student.stream,
            course: student.course,
            applicationId: student.applicationId,
            status: student.status,
            createdAt: student.createdAt
          }));
        }
      } catch (mongoError) {
        console.error('❌ MongoDB query error:', mongoError);
        // Fall back to memory storage
        allStudents = students.filter(s => !s.status || s.status === 'pending');
        console.log(`💾 Using ${allStudents.length} internal students due to MongoDB error`);
      }
    } else {
      console.log('💾 Using internal fallback data...');
      // Use in-memory students, filter only pending applications
      allStudents = students.filter(s => !s.status || s.status === 'pending');
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
      const stream = student.stream || 'Science';
      console.log(`👤 Processing: ${student.name} (${stream} - ${student.marks}%)`);
      
      if (meritByStream.hasOwnProperty(stream)) {
        meritByStream[stream].push({
          _id: student._id,
          name: student.name,
          email: student.email,
          marks: student.marks,
          preferredCourse: student.course,
          stream: stream,
          applicationId: student.applicationId,
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
          applicationId: student.applicationId,
          createdAt: student.createdAt
        });
      }
    });

    // Sort each stream by marks (highest first), then by application date for tie-breaking
    Object.keys(meritByStream).forEach(stream => {
      meritByStream[stream] = meritByStream[stream]
        .sort((a, b) => {
          if (b.marks !== a.marks) {
            return b.marks - a.marks;
          }
          // Tie-breaker: earlier application gets preference
          return new Date(a.createdAt) - new Date(b.createdAt);
        })
        .map((student, index) => ({
          ...student,
          rank: index + 1
        }));
    });

    // Add statistics
    const stats = {
      totalStudents: allStudents.length,
      streamCounts: {
        Science: meritByStream.Science.length,
        Arts: meritByStream.Arts.length,
        Commerce: meritByStream.Commerce.length
      },
      lastUpdated: new Date().toISOString()
    };

    console.log('🎯 Merit data being sent:', {
      Science: meritByStream.Science.length,
      Arts: meritByStream.Arts.length,
      Commerce: meritByStream.Commerce.length,
      totalStudents: stats.totalStudents
    });

    res.json({
      ...meritByStream,
      stats: stats,
      timestamp: new Date().toISOString(),
      source: mongoConnected ? 'mongodb' : 'memory'
    });
  } catch (error) {
    console.error("❌ Error fetching merit list:", error);
    res.status(500).json({ 
      error: "Failed to fetch merit list",
      timestamp: new Date().toISOString()
    });
  }
});
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