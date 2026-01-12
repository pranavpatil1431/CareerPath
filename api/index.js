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

// 🔴 Disable buffering (VERY IMPORTANT)
mongoose.set("bufferCommands", false);

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 
      "mongodb+srv://patilteju0409_db_user:Pranavteju%401431@cluster0.ahuv2zd.mongodb.net/careerpath?retryWrites=true&w=majority&appName=Cluster0", {
      serverSelectionTimeoutMS: 30000
    });
    console.log("✅ MongoDB connected on Vercel - IP WHITELIST FIXED");
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err.message);
  }
}

await connectDB();

// Schema
const StudentSchema = new mongoose.Schema({
  applicationId: String,
  name: String,
  email: String,
  marks: Number,
  stream: String,
  preferredCourse: String,
  subjects: [String],
  createdAt: { type: Date, default: Date.now }
});

const Student = mongoose.model("Student", StudentSchema);

// API Routes for deployment
app.get("/api/merit", async (req, res) => {
  try {
    const students = await Student.find().sort({ marks: -1 });
    console.log(`📋 Found ${students.length} students`);
    res.json(students);
  } catch (err) {
    console.error("❌ Merit error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post("/api/apply", async (req, res) => {
  try {
    const newStudent = await Student.create({
      ...req.body,
      applicationId: `APP${Date.now()}${Math.floor(Math.random() * 1000)}`
    });
    console.log(`✅ New application: ${newStudent.name}`);
    res.json({ success: true, applicationId: newStudent.applicationId });
  } catch (err) {
    console.error("❌ Apply error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Legacy routes (for backward compatibility)
app.get("/merit", async (req, res) => {
  try {
    const students = await Student.find().sort({ marks: -1 });
    res.json(students);
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

app.post("/apply", async (req, res) => {
  try {
    await Student.create(req.body);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

export default app;