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
app.use(express.static(path.join(__dirname, 'public')));

// ✅ In-memory storage (fallback if MongoDB is not available)
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
    createdAt: new Date() 
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
    createdAt: new Date() 
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
    createdAt: new Date() 
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
    createdAt: new Date() 
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
    createdAt: new Date() 
  }
];
let Student = null;
let mongoConnected = false;

// ✅ MongoDB Connection with fallback
const mongoURI = process.env.MONGO_URI || "mongodb://localhost:27017/careerpath";

console.log("🔌 Attempting to connect to MongoDB...");
mongoose.connect(mongoURI)
.then(() => {
  console.log("✅ MongoDB Connected Successfully");
  console.log(`📍 Connected to: ${mongoURI.replace(/\/\/.*:.*@/, '//***:***@')}`); // Hide password in logs
  mongoConnected = true;
  
  // ✅ Enhanced Student Schema
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
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
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
      enum: ['Science', 'Arts', 'Commerce']
    },
    course: { 
      type: String, 
      default: '',
      trim: true
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
    }
  }, { timestamps: true });

  // Add indexes for better performance
  studentSchema.index({ email: 1 });
  studentSchema.index({ marks: -1 });
  studentSchema.index({ stream: 1, marks: -1 });

  // ✅ Model
  Student = mongoose.model("Student", studentSchema);
})
.catch(err => {
  console.error("❌ MongoDB Connection Error:", err.message);
  console.log("💡 Using in-memory storage as fallback");
  mongoConnected = false;
});

// ✅ Routes
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get("/api", (req, res) => {
  res.send("Career Path API running with MongoDB!");
});

app.post("/apply", async (req, res) => {
  try {
    const { name, email, marks, stream, course } = req.body;
    
    console.log('📝 New application received:', { name, email, marks, stream, course });
    
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

    // Check for duplicate email
    let existingStudent = null;
    if (mongoConnected && Student) {
      try {
        existingStudent = await Student.findOne({ email: email.toLowerCase() });
      } catch (dbError) {
        console.log('Database check error, continuing with memory check');
      }
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
      createdAt: new Date()
    };

    let savedStudentId;
    let savedSuccessfully = false;

    if (mongoConnected && Student) {
      try {
        // Save to MongoDB
        console.log('💾 Saving to MongoDB...', studentData);
        const newStudent = new Student(studentData);
        const savedStudent = await newStudent.save();
        savedStudentId = savedStudent._id;
        savedSuccessfully = true;
        
        console.log('✅ Student saved to MongoDB:', savedStudent._id);
        
        // Also add to in-memory for immediate merit list updates
        const memoryStudent = {
          ...studentData,
          _id: savedStudent._id.toString()
        };
        students.push(memoryStudent);
        
      } catch (mongoError) {
        console.error('❌ MongoDB save error:', mongoError.message);
        // Fall back to in-memory storage
        savedStudentId = Date.now().toString();
        studentData._id = savedStudentId;
        students.push(studentData);
        savedSuccessfully = true;
      }
    } else {
      // Use only in-memory storage
      console.log('💾 Saving to memory storage...');
      savedStudentId = Date.now().toString();
      studentData._id = savedStudentId;
      students.push(studentData);
      savedSuccessfully = true;
    }

    if (savedSuccessfully) {
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
    } else {
      throw new Error('Failed to save student data');
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
      console.log('📊 Fetching from MongoDB...');
      try {
        // Get all students from MongoDB, only pending applications
        allStudents = await Student.find({ status: 'pending' }).sort({ marks: -1, createdAt: 1 });
        console.log(`📋 Found ${allStudents.length} students in MongoDB`);
      } catch (mongoError) {
        console.error('❌ MongoDB query error:', mongoError);
        // Fall back to memory storage
        allStudents = students.filter(s => !s.status || s.status === 'pending');
        console.log(`💾 Using ${allStudents.length} memory students due to error`);
      }
    } else {
      console.log('💾 Using memory storage...');
      // Use in-memory students, filter only pending applications
      allStudents = students.filter(s => !s.status || s.status === 'pending');
      console.log(`📋 Using ${allStudents.length} memory students`);
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
        const studentObj = student.toObject ? student.toObject() : student;
        meritByStream[stream].push({
          _id: studentObj._id,
          name: studentObj.name,
          email: studentObj.email,
          marks: studentObj.marks,
          preferredCourse: studentObj.course,
          stream: stream,
          applicationId: studentObj.applicationId,
          createdAt: studentObj.createdAt
        });
      } else {
        console.log(`⚠️ Unknown stream found: "${stream}" for student: ${student.name}`);
        // Add to Science as fallback
        const studentObj = student.toObject ? student.toObject() : student;
        meritByStream.Science.push({
          _id: studentObj._id,
          name: studentObj.name,
          email: studentObj.email,
          marks: studentObj.marks,
          preferredCourse: studentObj.course,
          stream: 'Science',
          applicationId: studentObj.applicationId,
          createdAt: studentObj.createdAt
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

// ✅ Admin Routes
const ADMIN_CREDENTIALS = {
  username: "admin",
  password: "admin123"
};

// Simple token storage (in production, use proper JWT with database)
const adminTokens = new Set();

// Generate simple token
function generateToken() {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

// Admin login
app.post("/admin/login", (req, res) => {
  const { username, password } = req.body;
  
  if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
    const token = generateToken();
    adminTokens.add(token);
    
    // Remove token after 24 hours
    setTimeout(() => {
      adminTokens.delete(token);
    }, 24 * 60 * 60 * 1000);
    
    res.json({ ok: true, token, message: "Login successful" });
  } else {
    res.status(401).json({ ok: false, error: "Invalid credentials" });
  }
});

// Middleware to verify admin token
function verifyAdminToken(req, res, next) {
  const token = req.headers['x-admin-token'];
  
  if (!token || !adminTokens.has(token)) {
    return res.status(401).json({ ok: false, error: "Unauthorized" });
  }
  
  next();
}

// Get all applicants (admin only)
app.get("/admin/applicants", verifyAdminToken, async (req, res) => {
  try {
    let allStudents;
    
    if (mongoConnected && Student) {
      allStudents = await Student.find().sort({ marks: -1 });
    } else {
      allStudents = [...students].sort((a, b) => b.marks - a.marks);
    }
    
    // Format the data for admin view
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

// Download CSV (admin only)
app.get("/admin/download/csv", verifyAdminToken, async (req, res) => {
  try {
    let allStudents;
    
    if (mongoConnected && Student) {
      allStudents = await Student.find().sort({ marks: -1 });
    } else {
      allStudents = [...students].sort((a, b) => b.marks - a.marks);
    }
    
    // Create CSV content
    let csvContent = "Rank,Name,Email,Marks,Stream,Course,Applied At\n";
    
    allStudents.forEach((student, index) => {
      const rank = index + 1;
      const appliedAt = student.createdAt ? new Date(student.createdAt).toLocaleString() : 'N/A';
      csvContent += `${rank},"${student.name}","${student.email}",${student.marks},"${student.stream}","${student.course}","${appliedAt}"\n`;
    });
    
    // Set headers for file download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="applicants.csv"');
    
    res.send(csvContent);
  } catch (error) {
    console.error("Error generating CSV:", error);
    res.status(500).json({ error: "Failed to generate CSV" });
  }
});

// ✅ Start Server
const PORT = process.env.PORT || 5000;

// Check if running on Vercel (serverless)
const isVercel = process.env.NODE_ENV === 'production' && process.env.VERCEL;

if (!isVercel) {
  // Local development environment
  const server = app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📱 Access your app at: http://localhost:${PORT}`);
  });

  server.on('error', (err) => {
    console.error('❌ Server error:', err);
    if (err.code === 'EADDRINUSE') {
      console.log('💡 Port is already in use. Trying to kill existing processes...');
      process.exit(1);
    }
  });

  // Handle graceful shutdown
  process.on('SIGTERM', () => {
    console.log('👋 Received SIGTERM, shutting down gracefully');
    server.close(() => {
      mongoose.connection.close();
      process.exit(0);
    });
  });

  // Commented out to prevent interference during testing
  // process.on('SIGINT', () => {
  //   console.log('👋 Received SIGINT, shutting down gracefully');
  //   server.close(() => {
  //     mongoose.connection.close();
  //     process.exit(0);
  //   });
  // });
}

// Export for Vercel serverless deployment
export default app;
