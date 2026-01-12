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

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Add logging for debugging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// 🔴 Disable buffering (VERY IMPORTANT)
mongoose.set("bufferCommands", false);

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 
      "mongodb+srv://patilteju0409_db_user:Pranavteju%401431@cluster0.ahuv2zd.mongodb.net/careerpath?retryWrites=true&w=majority&appName=Cluster0", {
      serverSelectionTimeoutMS: 30000
    });
    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1);
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
  createdAt: { type: Date, default: Date.now }
});

const Student = mongoose.model("Student", StudentSchema);

// Serve HTML files with error handling
app.get('/', (req, res) => {
  console.log('🏠 Serving index.html');
  const filePath = path.join(__dirname, 'public', 'index.html');
  console.log('📁 File path:', filePath);
  res.sendFile(filePath, (err) => {
    if (err) {
      console.error('❌ Error serving index.html:', err);
      res.status(500).send('Error loading homepage');
    }
  });
});

app.get('/merit', (req, res) => {
  console.log('🏆 Serving merit.html');
  res.sendFile(path.join(__dirname, 'public', 'merit.html'), (err) => {
    if (err) {
      console.error('❌ Error serving merit.html:', err);
      res.status(500).send('Error loading merit page');
    }
  });
});

app.get('/form', (req, res) => {
  console.log('📝 Serving form.html');
  res.sendFile(path.join(__dirname, 'public', 'form.html'), (err) => {
    if (err) {
      console.error('❌ Error serving form.html:', err);
      res.status(500).send('Error loading form page');
    }
  });
});

app.get('/admin', (req, res) => {
  console.log('👨‍💼 Serving admin.html');
  res.sendFile(path.join(__dirname, 'public', 'admin.html'), (err) => {
    if (err) {
      console.error('❌ Error serving admin.html:', err);
      res.status(500).send('Error loading admin page');
    }
  });
});

// API Routes
app.get("/api/merit", async (req, res) => {
  try {
    const students = await Student.find().sort({ marks: -1 });
    res.json(students);
  } catch (err) {
    console.error("❌ Merit error:", err);
    res.status(500).json({ success: false });
  }
});

app.post("/api/apply", async (req, res) => {
  try {
    await Student.create(req.body);
    res.json({ success: true });
  } catch (err) {
    console.error("❌ Apply error:", err);
    res.status(500).json({ success: false });
  }
});

// Catch-all route for undefined routes
app.get('*', (req, res) => {
  console.log('❓ Unknown route:', req.url);
  res.status(404).sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🚀 Server running on port ${PORT}`)
);
