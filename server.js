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

// ✅ MongoDB Connection with fallback
const mongoURI = process.env.MONGODB_URI || "mongodb://localhost:27017/careerpath";

mongoose.connect(mongoURI)
.then(() => console.log("✅ MongoDB Connected"))
.catch(err => {
  console.error("❌ MongoDB Connection Error:", err.message);
  console.log("💡 Tip: Make sure MongoDB is running locally or check your MONGODB_URI environment variable");
});

// ✅ Define Schema
const studentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  marks: { type: Number, required: true },
  stream: { type: String },
  course: { type: String }
}, { timestamps: true });

// ✅ Model
const Student = mongoose.model("Student", studentSchema);

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

    const newStudent = new Student({
      name: name.trim(),
      email: email.trim(),
      marks: Number(marks),
      stream: stream || '',
      course: course || ''
    });
    
    const savedStudent = await newStudent.save();
    
    res.status(201).json({ 
      ok: true, 
      id: savedStudent._id,
      message: "Application submitted successfully!" 
    });
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
    const students = await Student.find();
    res.json(students);
  } catch (error) {
    console.error("Error fetching students:", error);
    res.status(500).json({ error: "Failed to fetch students" });
  }
});

app.get("/merit", async (req, res) => {
  try {
    // Get students sorted by marks (highest first)
    const students = await Student.find().sort({ marks: -1 });
    res.json(students);
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
    const students = await Student.find().sort({ marks: -1 });
    
    // Format the data for admin view
    const formattedStudents = students.map(student => ({
      _id: student._id,
      name: student.name,
      email: student.email,
      marks: student.marks,
      stream: student.stream,
      course: student.course,
      applied_at: student.createdAt.toLocaleString()
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
    const students = await Student.find().sort({ marks: -1 });
    
    // Create CSV content
    let csvContent = "Rank,Name,Email,Marks,Stream,Course,Applied At\n";
    
    students.forEach((student, index) => {
      const rank = index + 1;
      const appliedAt = student.createdAt.toLocaleString();
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
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
