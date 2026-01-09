import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

mongoose.set("bufferCommands", false);

async function connectDB() {
  try {
    const MONGO_URI = process.env.MONGO_URI || 
                     process.env.MONGODB_URI || 
                     "mongodb+srv://patilteju0409_db_user:Pranavteju%401431@cluster0.ahuv2zd.mongodb.net/careerpath?retryWrites=true&w=majority";
    
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 30000
    });
    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1);
  }
}

await connectDB();

const Student = mongoose.model("Student", {
  applicationId: String,
  name: String,
  email: String,
  marks: Number,
  stream: String,
  preferredCourse: String,
  createdAt: { type: Date, default: Date.now }
});

app.get("/merit", async (req, res) => {
  try {
    const students = await Student.find().sort({ marks: -1 });
    res.json(students);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});

app.post("/apply", async (req, res) => {
  try {
    await Student.create(req.body);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on ${PORT}`));
