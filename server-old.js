import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// MongoDB connection
const MONGO_URI = process.env.MONGO_URI || 
                 process.env.MONGODB_URI || 
                 "mongodb://localhost:27017/careerpath";

mongoose.connect(MONGO_URI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch(err => console.error("❌ MongoDB connection error:", err));

// Student Schema
const Student = mongoose.model("Student", {
  applicationId: String,
  name: String,
  email: String,
  marks: Number,
  stream: String,
  preferredCourse: String,
  createdAt: { type: Date, default: Date.now }
});

// APPLY FORM
app.post("/apply", async (req, res) => {
  try {
    console.log("📝 Application received:", req.body);
    const student = new Student(req.body);
    await student.save();
    console.log("✅ Application saved successfully");
    res.json({ success: true });
  } catch (err) {
    console.error("❌ Error saving application:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// MERIT LIST
app.get("/merit", async (req, res) => {
  try {
    console.log("📊 Merit list requested");
    const students = await Student.find().sort({ marks: -1 });
    console.log(`📋 Found ${students.length} students`);
    res.json(students);
  } catch (err) {
    console.error("❌ Error fetching merit list:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📱 Access your app at: http://localhost:${PORT}`);
});

export default app;
const mongoURI = process.env.MONGO_URI || 
                process.env.MONGODB_URI || 
                process.env.DATABASE_URL || 
                "mongodb://localhost:27017/careerpath";

// Connection options for hosting platforms
const mongoOptions = {
  serverSelectionTimeoutMS: 10000, // 10 seconds
  socketTimeoutMS: 45000, // 45 seconds
  family: 4, // Use IPv4, skip IPv6
  maxPoolSize: 10,
  retryWrites: true,
  w: 'majority'
};

console.log("🔌 Attempting to connect to MongoDB for hosting...");
console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
console.log(`📍 MongoDB URI configured: ${mongoURI ? 'Yes' : 'No'}`);

mongoose.connect(mongoURI, mongoOptions)
.then(() => {
  console.log("✅ MongoDB Connected Successfully in hosting environment");
  console.log(`📍 Connected to: ${mongoURI.replace(/\/\/.*:.*@/, '//***:***@')}`); // Hide password in logs
  mongoConnected = true;
  
  // Test the connection
  mongoose.connection.db.admin().ping().then(() => {
    console.log("🏓 MongoDB ping successful - connection is healthy");
  }).catch(pingErr => {
    console.log("⚠️ MongoDB ping failed but connection established:", pingErr.message);
  });
  
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
    subjects: {
      type: [String],
      default: []
    },
    submittedAt: {
      type: Date,
      default: Date.now
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
  }, { 
    timestamps: true,
    strict: false  // Allow additional fields for compatibility
  });

  // Add indexes for better performance with proper unique email constraint
  studentSchema.index({ email: 1 }, { unique: true });
  studentSchema.index({ marks: -1 });
  studentSchema.index({ stream: 1, marks: -1 });

  // ✅ Model
  Student = mongoose.model("Student", studentSchema);
})
.catch(err => {
  console.error("❌ MongoDB Connection Error in hosting:", err.message);
  console.error("🔍 Error details:", {
    name: err.name,
    code: err.code,
    codeName: err.codeName,
    reason: err.reason?.message || 'Unknown'
  });
  
  // Check for common hosting issues
  if (err.message.includes('IP whitelist') || err.message.includes('not whitelisted')) {
    console.log("🚨 IP Whitelist Issue: Add your hosting platform's IP to MongoDB Atlas whitelist");
    console.log("💡 For Vercel: Add 0.0.0.0/0 to allow all IPs or check Vercel's IP ranges");
  }
  
  if (err.message.includes('authentication failed')) {
    console.log("🔐 Authentication Issue: Check your MongoDB credentials in environment variables");
  }
  
  if (err.message.includes('ENOTFOUND') || err.message.includes('getaddrinfo')) {
    console.log("🌐 Network Issue: Check your MongoDB connection string and DNS resolution");
  }
  
  console.log("💡 Using in-memory storage as fallback for hosting environment");
  console.log("⚠️ Note: In-memory data will reset on server restart in hosting");
  mongoConnected = false;
});

// Handle connection events for hosting
mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB connection error in hosting:', err);
  mongoConnected = false;
});

mongoose.connection.on('disconnected', () => {
  console.log('⚠️ MongoDB disconnected in hosting environment');
  mongoConnected = false;
});

mongoose.connection.on('reconnected', () => {
  console.log('✅ MongoDB reconnected in hosting environment');
  mongoConnected = true;
});

// ✅ Routes
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get("/api", (req, res) => {
  res.send("Career Path API running with MongoDB!");
});

// 🔍 Database inspection endpoint
app.get("/debug/students", async (req, res) => {
  try {
    console.log('🔍 Debug endpoint accessed');
    
    let allStudents = [];
    
    if (mongoConnected && Student) {
      try {
        allStudents = await Student.find({}).exec();
        console.log(`🔍 Found ${allStudents.length} students in MongoDB`);
      } catch (dbError) {
        console.log('🔍 MongoDB error, using memory storage');
        allStudents = students;
      }
    } else {
      console.log('🔍 Using memory storage');
      allStudents = students;
    }

    const debugData = {
      totalStudents: allStudents.length,
      mongoConnected: mongoConnected,
      students: allStudents.map(s => ({
        _id: s._id,
        name: s.name,
        email: s.email,
        marks: s.marks,
        stream: s.stream,
        course: s.course,
        applicationId: s.applicationId,
        createdAt: s.createdAt
      })),
      timestamp: new Date().toISOString()
    };

    console.log('🔍 Debug data being sent:', {
      count: debugData.totalStudents,
      mongoStatus: debugData.mongoConnected
    });

    res.json(debugData);
  } catch (error) {
    console.error('🔍 Debug endpoint error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Enhanced API endpoint for hosting compatibility
app.get("/api/apply", (req, res) => {
  res.status(405).json({ 
    ok: false, 
    error: "Method Not Allowed. Use POST to submit applications.",
    endpoints: {
      submitApplication: "POST /apply or POST /api/apply",
      getMeritList: "GET /merit",
      getApplications: "GET /api/students"
    }
  });
});

// Enhanced POST endpoint for hosting (Vercel/Netlify compatibility)
app.post("/api/apply", async (req, res) => {
  console.log('📝 API Application submission received');
  
  try {
    const { name, email, marks, stream, course } = req.body;
    
    // Enhanced validation for hosting
    if (!name || name.trim().length < 2) {
      return res.status(400).json({ 
        ok: false, 
        error: "Name is required and must be at least 2 characters." 
      });
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ 
        ok: false, 
        error: "Valid email address is required." 
      });
    }

    if (!marks || isNaN(marks) || marks < 0 || marks > 100) {
      return res.status(400).json({ 
        ok: false, 
        error: "Valid marks between 0 and 100 are required." 
      });
    }

    const validStreams = ['Science', 'Arts', 'Commerce'];
    const selectedStream = stream || 'Science';
    if (!validStreams.includes(selectedStream)) {
      return res.status(400).json({ 
        ok: false, 
        error: "Invalid stream. Must be Science, Arts, or Commerce." 
      });
    }

    // Enhanced duplicate check for hosting
    let existingStudent = null;
    if (mongoConnected && Student) {
      try {
        existingStudent = await Student.findOne({ 
          email: { $regex: new RegExp('^' + email.trim().toLowerCase() + '$', 'i') }
        });
      } catch (dbError) {
        console.log('🔍 Database check error for hosting:', dbError.message);
      }
    }
    
    if (!existingStudent) {
      existingStudent = students.find(s => 
        s.email.toLowerCase() === email.trim().toLowerCase()
      );
    }

    if (existingStudent) {
      return res.status(400).json({ 
        ok: false, 
        error: "Application already exists for this email address.",
        suggestion: "Please use a different email or check the merit list."
      });
    }

    // Enhanced application ID generation for hosting
    const timestamp = Date.now();
    const randomSuffix = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    const applicationId = `APP${timestamp}${randomSuffix}`;

    const studentData = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      marks: Number(marks),
      stream: selectedStream,
      course: course?.trim() || '',
      subjects: [], // Initialize for compatibility
      applicationId: applicationId,
      status: 'pending',
      submittedAt: new Date(),
      createdAt: new Date()
    };

    let savedStudentId;
    let savedSuccessfully = false;
    let savedToMongoDB = false;

    // Enhanced MongoDB save with better error handling for hosting
    if (mongoConnected && Student) {
      try {
        console.log('💾 Saving to MongoDB (hosting mode)...', {
          name: studentData.name,
          email: studentData.email,
          marks: studentData.marks,
          stream: studentData.stream
        });
        
        const newStudent = new Student(studentData);
        const savedStudent = await newStudent.save();
        savedStudentId = savedStudent._id;
        savedSuccessfully = true;
        savedToMongoDB = true;
        
        console.log('✅ Student saved to MongoDB in hosting mode:', savedStudent._id);
        
        // Also add to in-memory for immediate access
        const memoryStudent = {
          ...studentData,
          _id: savedStudent._id.toString()
        };
        students.push(memoryStudent);
        
      } catch (mongoError) {
        console.error('❌ MongoDB save error in hosting:', mongoError.message);
        console.error('🔍 Error details:', {
          name: mongoError.name,
          code: mongoError.code,
          message: mongoError.message
        });
        
        // Fall back to in-memory storage for hosting reliability
        savedStudentId = `mem_${timestamp}_${randomSuffix}`;
        studentData._id = savedStudentId;
        students.push(studentData);
        savedSuccessfully = true;
        savedToMongoDB = false;
      }
    } else {
      console.log('💾 Using memory storage for hosting...');
      savedStudentId = `mem_${timestamp}_${randomSuffix}`;
      studentData._id = savedStudentId;
      students.push(studentData);
      savedSuccessfully = true;
      savedToMongoDB = false;
    }

    if (savedSuccessfully) {
      console.log(`✅ New student added in hosting mode: ${studentData.name} (${studentData.marks}% - ${studentData.stream})`);
      console.log(`📊 Total students now: ${students.length} (MongoDB: ${savedToMongoDB ? 'Yes' : 'No'})`);
      
      res.status(201).json({ 
        ok: true, 
        success: true,
        id: savedStudentId,
        applicationId: applicationId,
        savedToDatabase: savedToMongoDB,
        message: "🎉 Application submitted successfully! Your application has been recorded and you can now check your ranking in the merit list.",
        student: {
          id: savedStudentId,
          name: studentData.name,
          email: studentData.email,
          marks: studentData.marks,
          stream: studentData.stream,
          course: studentData.course,
          applicationId: applicationId,
          submittedAt: studentData.submittedAt
        },
        nextSteps: {
          viewMeritList: "/merit.html",
          checkRanking: "Your ranking will be available immediately in the merit list",
          estimatedRank: `Based on your marks (${studentData.marks}%), you're performing well!`
        }
      });
    } else {
      res.status(500).json({ 
        ok: false, 
        error: "Failed to save application. Please try again.",
        supportInfo: "If this problem persists, please contact support."
      });
    }

  } catch (error) {
    console.error('❌ API Application submission error in hosting:', error);
    res.status(500).json({ 
      ok: false, 
      error: "Internal server error. Please try again.",
      message: "We're experiencing technical difficulties. Your application was not saved.",
      retry: true
    });
  }
});

// ✅ Enhanced /apply endpoint for hosting compatibility
app.post('/apply', async (req, res) => {
  console.log('📤 /apply endpoint called with body:', req.body);
  
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

// Enhanced merit list endpoint for hosting environments
app.get("/api/merit", async (req, res) => {
  try {
    let allStudents;
    
    console.log('🏆 API Merit list request received for hosting');
    console.log('🔗 MongoDB connected:', mongoConnected);
    
    if (mongoConnected && Student) {
      console.log('📊 Fetching data from MongoDB for hosting...');
      try {
        // Get ALL students from MongoDB with enhanced error handling for hosting
        allStudents = await Student.find({}).sort({ marks: -1, createdAt: 1 }).lean();
        console.log(`📋 Found ${allStudents.length} students in MongoDB for hosting`);
        
        if (allStudents.length === 0) {
          console.log('🔍 No students in MongoDB, checking memory storage...');
          allStudents = [...students].sort((a, b) => {
            if (b.marks !== a.marks) return b.marks - a.marks;
            return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
          });
          console.log(`📋 Using ${allStudents.length} memory students for hosting`);
        }
      } catch (mongoError) {
        console.error('❌ MongoDB query error in hosting:', mongoError);
        allStudents = [...students].sort((a, b) => {
          if (b.marks !== a.marks) return b.marks - a.marks;
          return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
        });
        console.log(`💾 Using ${allStudents.length} memory students due to MongoDB error in hosting`);
      }
    } else {
      console.log('💾 Using memory storage for hosting...');
      allStudents = [...students].sort((a, b) => {
        if (b.marks !== a.marks) return b.marks - a.marks;
        return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
      });
      console.log(`📋 Using ${allStudents.length} memory students for hosting`);
    }

    // Enhanced processing for hosting with better performance
    const meritByStream = {
      Science: [],
      Arts: [],
      Commerce: []
    };

    let totalMarks = 0;
    let validMarksCount = 0;
    const streamCounts = { Science: 0, Arts: 0, Commerce: 0 };
    const streamTotalMarks = { Science: 0, Arts: 0, Commerce: 0 };

    // Process students with enhanced data structure for hosting
    let overallRank = 1;
    allStudents.forEach((student, index) => {
      const stream = student.stream || 'Science';
      const marks = Number(student.marks) || 0;
      
      console.log(`👤 Processing for hosting: ${student.name} (${stream} - ${marks}%)`);
      
      if (marks >= 0 && marks <= 100) {
        totalMarks += marks;
        validMarksCount++;
        
        streamCounts[stream]++;
        streamTotalMarks[stream] += marks;
      }
      
      if (meritByStream.hasOwnProperty(stream)) {
        const studentObj = {
          _id: student._id?.toString() || `temp_${Date.now()}_${index}`,
          name: student.name || 'Unknown',
          email: student.email || '',
          marks: marks,
          stream: stream,
          course: student.course || '',
          applicationId: student.applicationId || `APP${Date.now()}`,
          rank: overallRank++,
          overallRank: overallRank - 1,
          streamRank: meritByStream[stream].length + 1,
          submittedAt: student.submittedAt || student.createdAt || new Date(),
          subjects: student.subjects || []
        };
        meritByStream[stream].push(studentObj);
      }
    });

    // Sort each stream by marks (descending) for hosting
    Object.keys(meritByStream).forEach(stream => {
      meritByStream[stream].sort((a, b) => {
        if (b.marks !== a.marks) return b.marks - a.marks;
        return new Date(a.submittedAt) - new Date(b.submittedAt);
      });
      
      // Update stream ranks after sorting
      meritByStream[stream].forEach((student, index) => {
        student.streamRank = index + 1;
      });
      
      console.log(`🎯 ${stream} stream sorted with ${meritByStream[stream].length} students for hosting`);
    });

    // Enhanced statistics for hosting
    const overallAverage = validMarksCount > 0 ? (totalMarks / validMarksCount).toFixed(2) : 0;
    const streamAverages = {};
    Object.keys(streamTotalMarks).forEach(stream => {
      streamAverages[stream] = streamCounts[stream] > 0 
        ? (streamTotalMarks[stream] / streamCounts[stream]).toFixed(2) 
        : 0;
    });

    const responseData = {
      success: true,
      timestamp: new Date().toISOString(),
      environment: 'hosting',
      dataSource: mongoConnected ? 'mongodb' : 'memory',
      Science: meritByStream.Science,
      Arts: meritByStream.Arts,
      Commerce: meritByStream.Commerce,
      stats: {
        totalStudents: allStudents.length,
        validApplications: validMarksCount,
        averageMarks: parseFloat(overallAverage),
        streamCounts: streamCounts,
        streamAverages: streamAverages,
        topPerformer: allStudents.length > 0 ? {
          name: allStudents[0].name,
          marks: allStudents[0].marks,
          stream: allStudents[0].stream
        } : null
      }
    };

    console.log('🎯 Comprehensive merit data for hosting being sent:', {
      Science: responseData.Science.length,
      Arts: responseData.Arts.length,
      Commerce: responseData.Commerce.length,
      totalStudents: responseData.stats.totalStudents,
      averageMarks: responseData.stats.averageMarks,
      dataSource: responseData.dataSource
    });
    
    // Enhanced caching headers for hosting
    res.set({
      'Cache-Control': 'public, max-age=60', // Cache for 60 seconds
      'ETag': `"merit-${Date.now()}"`,
      'X-Data-Source': responseData.dataSource,
      'X-Total-Students': responseData.stats.totalStudents
    });
    
    res.json(responseData);
    
  } catch (error) {
    console.error('❌ Merit list error in hosting:', error);
    console.error('🔍 Error details for hosting:', {
      name: error.name,
      message: error.message,
      stack: error.stack?.split('\n').slice(0, 3)
    });
    
    // Enhanced error response for hosting
    res.status(500).json({ 
      success: false,
      error: "Failed to load merit data",
      message: "We're experiencing technical difficulties loading the merit list.",
      environment: 'hosting',
      timestamp: new Date().toISOString(),
      fallback: {
        Science: [],
        Arts: [],
        Commerce: [],
        stats: {
          totalStudents: 0,
          averageMarks: 0
        }
      },
      retry: true
    });
  }
});

// Simple merit endpoint for localhost testing
app.get("/merit", async (req, res) => {
  try {
    let allStudents;
    
    console.log('🏆 Merit list request received - generating comprehensive results');
    console.log('🔗 MongoDB connected:', mongoConnected);
    
    if (mongoConnected && Student) {
      console.log('📊 Fetching comprehensive data from MongoDB...');
      try {
        // Get ALL students from MongoDB (not filtering by status for populated data)
        allStudents = await Student.find({}).sort({ marks: -1, createdAt: 1 });
        console.log(`📋 Found ${allStudents.length} students in MongoDB for complete results`);
        
        // If no students found, try without any filters
        if (allStudents.length === 0) {
          console.log('🔍 No students found with status filter, trying all students...');
          allStudents = await Student.find().sort({ marks: -1 });
          console.log(`📋 Found ${allStudents.length} total students in MongoDB`);
        }
      } catch (mongoError) {
        console.error('❌ MongoDB query error:', mongoError);
        // Fall back to memory storage
        allStudents = students.filter(s => !s.status || s.status === 'pending');
        console.log(`💾 Using ${allStudents.length} memory students due to MongoDB error`);
      }
    } else {
      console.log('💾 Using memory storage for comprehensive results...');
      // Use in-memory students, filter only pending applications
      allStudents = students.filter(s => !s.status || s.status === 'pending');
      console.log(`📋 Using ${allStudents.length} memory students for complete results`);
    }

    // Group students by stream and sort comprehensively
    const meritByStream = {
      Science: [],
      Arts: [],
      Commerce: []
    };

    // Track comprehensive statistics
    let totalMarks = 0;
    let maxMarks = 0;
    let minMarks = 100;
    const markRanges = {
      excellent: 0, // 90+
      good: 0,      // 75-89
      average: 0,   // 60-74
      below: 0      // <60
    };

    // Group students by their stream with comprehensive processing
    allStudents.forEach(student => {
      const stream = student.stream || 'Science';
      console.log(`👤 Processing for complete results: ${student.name} (${stream} - ${student.marks}%)`);
      
      // Track statistics
      totalMarks += student.marks;
      maxMarks = Math.max(maxMarks, student.marks);
      minMarks = Math.min(minMarks, student.marks);
      
      if (student.marks >= 90) markRanges.excellent++;
      else if (student.marks >= 75) markRanges.good++;
      else if (student.marks >= 60) markRanges.average++;
      else markRanges.below++;
      
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
        console.log(`⚠️ Unknown stream found: "${stream}" for student: ${student.name} - adding to Science`);
        // Add to Science as fallback
        const studentObj = student.toObject ? student.toObject() : student;
        meritByStream.Science.push({
          _id: studentObj._id,
          name: studentObj.name,
          email: studentObj.email,
          marks: studentObj.marks,
          preferredCourse: studentObj.course,
          stream: 'Science', // Fallback stream
          applicationId: studentObj.applicationId,
          createdAt: studentObj.createdAt
        });
      }
    });

    // Sort each stream comprehensively by marks (highest first), then by application date for tie-breaking
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
      
      console.log(`🎯 ${stream} stream sorted with ${meritByStream[stream].length} students`);
    });

    // Calculate comprehensive statistics
    const totalStudents = allStudents.length;
    const averageMarks = totalStudents > 0 ? (totalMarks / totalStudents).toFixed(2) : 0;
    
    const comprehensiveStats = {
      totalStudents,
      averageMarks: parseFloat(averageMarks),
      maxMarks: totalStudents > 0 ? maxMarks : 0,
      minMarks: totalStudents > 0 ? minMarks : 0,
      streamCounts: {
        Science: meritByStream.Science.length,
        Arts: meritByStream.Arts.length,
        Commerce: meritByStream.Commerce.length
      },
      markDistribution: markRanges,
      lastUpdated: new Date().toISOString(),
      dataSource: mongoConnected ? 'mongodb' : 'memory'
    };

    console.log('🎯 Comprehensive merit data being sent:', {
      Science: meritByStream.Science.length,
      Arts: meritByStream.Arts.length,
      Commerce: meritByStream.Commerce.length,
      totalStudents: comprehensiveStats.totalStudents,
      averageMarks: comprehensiveStats.averageMarks
    });

    // Return comprehensive results
    const response = {
      ...meritByStream,
      stats: comprehensiveStats,
      timestamp: new Date().toISOString(),
      success: true,
      message: 'Complete merit list data retrieved successfully'
    };

    res.json(response);
  } catch (error) {
    console.error("❌ Error fetching comprehensive merit list:", error);
    res.status(500).json({ 
      error: "Failed to fetch complete merit list",
      timestamp: new Date().toISOString(),
      success: false
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
