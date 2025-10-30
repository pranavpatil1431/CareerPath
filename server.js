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
  name: String,
  branch: String,
  marks: Number
});

// ✅ Model
const Student = mongoose.model("Student", studentSchema);

// ✅ Routes
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get("/api", (req, res) => {
  res.send("Career Path API running with MongoDB!");
});

app.post("/add-student", async (req, res) => {
  try {
    const newStudent = new Student(req.body);
    await newStudent.save();
    res.status(201).send({ message: "Student added successfully!" });
  } catch (error) {
    res.status(500).send({ error: "Error adding student", details: error });
  }
});

app.get("/students", async (req, res) => {
  const students = await Student.find();
  res.json(students);
});

// ✅ Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
