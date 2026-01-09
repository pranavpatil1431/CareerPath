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

// Add request logging
app.use((req, res, next) => {
  console.log(`📡 ${req.method} ${req.url} - ${new Date().toISOString()}`);
  next();
});

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// MongoDB connection
const MONGO_URI = process.env.MONGO_URI || 
                 process.env.MONGODB_URI || 
                 "mongodb://localhost:27017/careerpath";

mongoose.connect(MONGO_URI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch(err => console.error("❌ MongoDB connection error:", err));

// Student Schema - Updated to match existing data
const Student = mongoose.model("Student", {
  applicationId: String,
  name: String,
  email: String,
  marks: Number,
  stream: String,
  preferredCourse: String,
  subjects: [String],
  submittedAt: { type: Date, default: Date.now },
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