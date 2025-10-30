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

// ✅ Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
