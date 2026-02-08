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
    
    // Return empty array if no students found - no sample data
    if (students.length === 0) {
      console.log('📋 No students found, returning empty data');
      return res.json({ success: true, data: [], count: 0, courseStats: [] });
    }
    
    // Calculate course selection statistics with grouped categories
    const courseCategories = {
      'Engineering': 0,
      'Medical': 0, 
      'Pharmacy': 0,
      'Other': 0
    };
    
    students.forEach(student => {
      if (student.preferredCourse) {
        const course = student.preferredCourse.toLowerCase();
        
        if (course.includes('b.tech') || course.includes('engineering') || course.includes('automobile') || course.includes('chemical') || course.includes('aerospace') || course.includes('electronics') || course.includes('information technology')) {
          courseCategories['Engineering']++;
        } else if (course.includes('mbbs') || course.includes('bds') || course.includes('medical') || course.includes('bams') || course.includes('bhms') || course.includes('nursing') || course.includes('bpt') || course.includes('bmlt') || course.includes('optometry') || course.includes('radiology')) {
          courseCategories['Medical']++;
        } else if (course.includes('pharmacy') || course.includes('pharm.d') || course.includes('pharmaceutical')) {
          courseCategories['Pharmacy']++;
        } else {
          courseCategories['Other']++;
        }
      }
    });
    
    // Convert to percentage and format for frontend
    const courseStatsArray = Object.entries(courseCategories).map(([category, count]) => ({
      course: category,
      count,
      percentage: ((count / students.length) * 100).toFixed(1)
    })).filter(stat => stat.count > 0).sort((a, b) => b.count - a.count);
    
    console.log(`📋 Found ${students.length} students`);
    console.log('📊 Course statistics:', courseStatsArray);
    res.json({ 
      success: true, 
      data: students, 
      count: students.length,
      courseStats: courseStatsArray
    });
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
      // Return error if database is not connected
      return res.status(503).json({ error: "Database not connected" });
    }

    const students = await Student.find().sort({ marks: -1 }).maxTimeMS(10000);
    
    // Return empty array if no students found - no sample data
    if (students.length === 0) {
      console.log('📋 Legacy endpoint: No students found, returning empty array');
      return res.json([]);
    }
    
    res.json(students);
  } catch (err) {
    console.error("❌ Legacy merit error:", err.message);
    // Return error instead of sample data
    res.status(500).json({ error: "Failed to fetch merit list" });
  }
});

// Excel export route
app.get("/api/export/excel", async (req, res) => {
  try {
    console.log("📊 Exporting student data to Excel...");
    
    // Get all students sorted by marks (highest first)
    const students = await Student.find().sort({ marks: -1 });
    
    console.log(`📊 Found ${students.length} students to export`);
    
    // If no students, return an empty Excel with headers only
    if (students.length === 0) {
      console.log("📋 No students found - creating empty Excel file");
      
      // Create empty export with just headers
      const emptyData = [{
        "Rank": "No data available",
        "Application ID": "",
        "Name": "",
        "Email": "",
        "Phone": "",
        "Date of Birth": "",
        "Marks": "",
        "Stream": "",
        "Preferred Course": "",
        "Alternative Course": "",
        "Address": "",
        "Application Date": ""
      }];
      
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(emptyData);
      
      // Auto-resize columns
      const cols = [
        { width: 20 },  // Rank
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
      
      XLSX.utils.book_append_sheet(workbook, worksheet, "No Students Found");
      
      const excelBuffer = XLSX.write(workbook, {
        type: 'buffer',
        bookType: 'xlsx'
      });
      
      const fileName = `CareerPath_Empty_${new Date().toISOString().split('T')[0]}.xlsx`;
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      
      console.log(`✅ Empty Excel file generated: ${fileName}`);
      res.send(excelBuffer);
      return;
    }
    
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

const PORT = process.env.PORT || 5000;

// Catch-all route for undefined routes (MUST be last)
app.get('*', (req, res) => {
  console.log('❓ Unknown route:', req.url);
  res.status(404).sendFile(path.join(__dirname, 'public', 'index.html'));
});

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
