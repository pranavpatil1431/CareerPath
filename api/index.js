import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

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
    console.log("✅ MongoDB connected on Vercel");
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

// Routes
app.get("/merit", async (req, res) => {
  try {
    const students = await Student.find().sort({ marks: -1 });
    console.log(`📋 Found ${students.length} students on Vercel`);
    res.json(students);
  } catch (err) {
    console.error("❌ Merit error:", err);
    res.status(500).json({ success: false });
  }
});

app.post("/apply", async (req, res) => {
  try {
    await Student.create(req.body);
    res.json({ success: true });
  } catch (err) {
    console.error("❌ Apply error:", err);
    res.status(500).json({ success: false });
  }
});

export default app;