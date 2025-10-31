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
let students = [];
let Student = null;
let mongoConnected = false;

// ✅ MongoDB Connection with fallback
const mongoURI = process.env.MONGODB_URI || "mongodb://localhost:27017/careerpath";

mongoose.connect(mongoURI)
.then(() => {
  console.log("✅ MongoDB Connected");
  mongoConnected = true;
  
  // ✅ Define Schema
  const studentSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    marks: { type: Number, required: true },
    stream: { type: String },
    course: { type: String }
  }, { timestamps: true });

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
      if (meritByStream[stream]) {
        meritByStream[stream].push(student);
      }
    });

    // Sort each stream by marks (highest first) and add rank
    Object.keys(meritByStream).forEach(stream => {
      meritByStream[stream] = meritByStream[stream]
        .sort((a, b) => b.marks - a.marks)
        .map((student, index) => ({
          ...student.toObject ? student.toObject() : student,
          rank: index + 1,
          stream: stream
        }));
    });

    res.json(meritByStream);
  } catch (error) {
    console.error("Error fetching merit list:", error);
    res.status(500).json({ error: "Failed to fetch merit list" });
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

  process.on('SIGINT', () => {
    console.log('👋 Received SIGINT, shutting down gracefully');
    server.close(() => {
      mongoose.connection.close();
      process.exit(0);
    });
  });
}

// Export for Vercel serverless deployment
export default app;
