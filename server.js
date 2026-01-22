import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import XLSX from "xlsx";

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
    const mongoURI = process.env.MONGO_URI || 
      "mongodb+srv://patilteju0409_db_user:Pranavteju%401431@cluster0.ahuv2zd.mongodb.net/careerpath?retryWrites=true&w=majority&appName=Cluster0";
    
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000
    });
    console.log("✅ MongoDB connected successfully");
    return true;
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err.message);
    // Don't exit process immediately, try to continue
    return false;
  }
}

// Initialize database connection
const dbConnected = await connectDB();
if (!dbConnected) {
  console.warn("⚠️ Starting server without database connection");
}

// Health check endpoint
app.get('/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    database: dbStatus,
    uptime: process.uptime()
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Schema
const StudentSchema = new mongoose.Schema({
  applicationId: String,
  name: String,
  email: String,
  phone: String,
  dateOfBirth: Date,
  marks: Number,
  stream: String,
  preferredCourse: String,
  alternativeCourse: String,
  address: String,
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
    // Check database connection
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ 
        success: false, 
        error: "Database not connected" 
      });
    }

    const students = await Student.find().sort({ marks: -1 }).maxTimeMS(10000);
    
    // If no students found, provide sample data for demo
    if (students.length === 0) {
      const sampleData = [
        {
          applicationId: "APP001",
          name: "Sample Student 1",
          email: "student1@example.com",
          marks: 95,
          stream: "Science",
          preferredCourse: "Engineering",
          createdAt: new Date()
        },
        {
          applicationId: "APP002", 
          name: "Sample Student 2",
          email: "student2@example.com",
          marks: 88,
          stream: "Commerce",
          preferredCourse: "Business",
          createdAt: new Date()
        },
        {
          applicationId: "APP003",
          name: "Sample Student 3", 
          email: "student3@example.com",
          marks: 82,
          stream: "Arts",
          preferredCourse: "Literature",
          createdAt: new Date()
        }
      ];
      
      console.log(`📋 No data found, returning sample data (${sampleData.length} students)`);
      return res.json({ success: true, data: sampleData, count: sampleData.length, demo: true });
    }
    
    console.log(`📋 Found ${students.length} students`);
    res.json({ success: true, data: students, count: students.length });
  } catch (err) {
    console.error("❌ Merit error:", err.message);
    res.status(500).json({ 
      success: false, 
      error: "Failed to fetch merit list",
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

app.post("/api/apply", async (req, res) => {
  try {
    // Check database connection
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ 
        success: false, 
        error: "Database not connected" 
      });
    }

    // Basic validation
    const { name, email, marks } = req.body;
    if (!name || !email || marks === undefined) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: name, email, marks"
      });
    }

    const applicationId = `APP${Date.now()}${Math.floor(Math.random() * 1000)}`;
    const newStudent = await Student.create({
      ...req.body,
      applicationId
    });
    
    console.log(`✅ New application: ${newStudent.name} (${applicationId})`);
    res.json({ 
      success: true, 
      applicationId: newStudent.applicationId,
      message: "Application submitted successfully"
    });
  } catch (err) {
    console.error("❌ Apply error:", err.message);
    res.status(500).json({ 
      success: false, 
      error: "Failed to submit application",
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// Legacy /merit endpoint for backward compatibility
app.get("/merit", async (req, res) => {
  try {
    // Check database connection
    if (mongoose.connection.readyState !== 1) {
      // Return sample data if database is not connected
      const sampleData = [
        { applicationId: "APP001", name: "Sample Student 1", marks: 95, stream: "Science", preferredCourse: "Engineering", createdAt: new Date() },
        { applicationId: "APP002", name: "Sample Student 2", marks: 88, stream: "Commerce", preferredCourse: "Business", createdAt: new Date() },
        { applicationId: "APP003", name: "Sample Student 3", marks: 82, stream: "Arts", preferredCourse: "Literature", createdAt: new Date() }
      ];
      return res.json(sampleData);
    }

    const students = await Student.find().sort({ marks: -1 }).maxTimeMS(10000);
    
    // If no students, return sample data for demonstration
    if (students.length === 0) {
      const sampleData = [
        { applicationId: "APP001", name: "Sample Student 1", marks: 95, stream: "Science", preferredCourse: "Engineering", createdAt: new Date() },
        { applicationId: "APP002", name: "Sample Student 2", marks: 88, stream: "Commerce", preferredCourse: "Business", createdAt: new Date() },
        { applicationId: "APP003", name: "Sample Student 3", marks: 82, stream: "Arts", preferredCourse: "Literature", createdAt: new Date() }
      ];
      return res.json(sampleData);
    }
    
    res.json(students);
  } catch (err) {
    console.error("❌ Legacy merit error:", err.message);
    // Return sample data as fallback
    const sampleData = [
      { applicationId: "APP001", name: "Sample Student 1", marks: 95, stream: "Science", preferredCourse: "Engineering", createdAt: new Date() },
      { applicationId: "APP002", name: "Sample Student 2", marks: 88, stream: "Commerce", preferredCourse: "Business", createdAt: new Date() },
      { applicationId: "APP003", name: "Sample Student 3", marks: 82, stream: "Arts", preferredCourse: "Literature", createdAt: new Date() }
    ];
    res.json(sampleData);
  }
});

// Excel export route
app.get("/api/export/excel", async (req, res) => {
  try {
    console.log("📊 Exporting student data to Excel...");
    
    // Get all students sorted by marks (highest first)
    const students = await Student.find().sort({ marks: -1 });
    
    // Prepare data for Excel export
    const exportData = students.map((student, index) => ({
      "Rank": index + 1,
      "Application ID": student.applicationId || `APP${String(index + 1).padStart(3, '0')}`,
      "Name": student.name,
      "Email": student.email,
      "Phone": student.phone || "Not provided",
      "Date of Birth": student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString() : "Not provided",
      "Marks": student.marks,
      "Stream": student.stream,
      "Preferred Course": student.preferredCourse,
      "Alternative Course": student.alternativeCourse || "Not selected",
      "Address": student.address || "Not provided",
      "Application Date": new Date(student.createdAt).toLocaleDateString()
    }));

    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    
    // Auto-resize columns with appropriate widths
    const cols = [
      { width: 8 },   // Rank
      { width: 15 },  // Application ID
      { width: 25 },  // Name
      { width: 30 },  // Email
      { width: 15 },  // Phone
      { width: 12 },  // Date of Birth
      { width: 8 },   // Marks
      { width: 15 },  // Stream
      { width: 30 },  // Preferred Course
      { width: 30 },  // Alternative Course
      { width: 40 },  // Address
      { width: 15 }   // Application Date
    ];
    worksheet['!cols'] = cols;
    
    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, "Students Merit List");
    
    // Generate Excel file buffer
    const excelBuffer = XLSX.write(workbook, {
      type: 'buffer',
      bookType: 'xlsx'
    });
    
    // Set response headers
    const fileName = `CareerPath_Students_${new Date().toISOString().split('T')[0]}.xlsx`;
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    
    console.log(`✅ Excel file generated successfully: ${fileName}`);
    res.send(excelBuffer);
    
  } catch (err) {
    console.error("❌ Excel export error:", err);
    res.status(500).json({ success: false, error: "Failed to export Excel file" });
  }
});

// Catch-all route for undefined routes
app.get('*', (req, res) => {
  console.log('❓ Unknown route:', req.url);
  res.status(404).sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 5000;

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  res.status(500).json({ 
    success: false, 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'production' ? 'Something went wrong' : err.message
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📊 Database status: ${mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'}`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  try {
    await mongoose.connection.close();
    console.log('Database connection closed');
  } catch (err) {
    console.log('Error closing database connection:', err.message);
  }
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully');
  try {
    await mongoose.connection.close();
    console.log('Database connection closed');
  } catch (err) {
    console.log('Error closing database connection:', err.message);
  }
  process.exit(0);
});
