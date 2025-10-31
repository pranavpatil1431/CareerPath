# CareerPath — Student Admission Portal

A modern, full-stack web application for student admissions with professional UI, robust backend, and cloud deployment.

## 🌟 Live Demo
🔗 **[Visit CareerPath Application](https://careerpath-full.vercel.app)**

## ✨ Features

- **📝 Online Application Form** - Student admission applications with validation
- **🏆 Real-time Merit List** - Live rankings based on academic performance  
- **👨‍💼 Admin Dashboard** - Secure admin panel with data management
- **📱 Responsive Design** - Works perfectly on all devices
- **🔐 Authentication System** - Secure admin login and data protection
- **📊 Data Export** - Download applications data as CSV
- **🚀 Cloud Deployment** - Hosted on Vercel with MongoDB Atlas
- **⚡ Real-time Updates** - Auto-refresh merit list and admin data

## 📁 Project Structure

```
CareerPath_Full/
├── .env                     # Environment variables (local)
├── .env.example             # Environment template  
├── .env.production          # Production environment template
├── .gitignore               # Git ignore rules
├── README.md                # This file
├── DEPLOYMENT.md            # Deployment guide
├── package.json             # Node.js dependencies and scripts
├── server.js                # Express.js server (main application)
├── vercel.json              # Vercel deployment configuration
├── database/                # Database files
│   └── db.sql               # Legacy database schema
├── docs/                    # Documentation
│   └── README.md            # Detailed project documentation
├── public/                  # Frontend files
│   ├── index.html           # Home page
│   ├── form.html            # Application form
│   ├── merit.html           # Merit list
│   ├── admin.html           # Admin panel
│   ├── admission.html       # Admission process
│   ├── courses.html         # Courses & syllabus
│   ├── exams.html           # Entrance exams
│   ├── colleges.html        # Colleges information
│   ├── allotment.html       # Allotment process
│   ├── test.html            # API testing page
│   └── assets/              # Static assets
│       ├── css/
│       │   └── style.css    # Modern responsive stylesheet
│       └── js/
│           ├── form.js      # Form handling & validation
│           ├── merit.js     # Merit list functionality
│           └── admin.js     # Admin panel management
└── scripts/                 # Setup scripts
    ├── setup.bat            # Windows setup
    └── setup.sh             # Unix/Linux setup
        ├── form.html        # Student application form
        ├── merit.html       # Merit list display
        ├── admin.html       # Admin panel
        └── assets/          # Static assets
            ├── css/
            │   └── style.css
            └── js/
                ├── admin.js
                ├── form.js
                └── merit.js
```

## 🚀 Getting Started

### Prerequisites
- Node.js (LTS version)
- MongoDB (local installation or MongoDB Atlas account)
- Git (optional)

### Installation

1. **Clone the repository** (if using Git):
   ```bash
   git clone <repository-url>
   cd CareerPath_Full
   ```

2. **Install dependencies**:
   ```bash
   cd src
   npm install
   ```

3. **Set up the database**:
   - For **Local MongoDB**: Install and start MongoDB locally
   - For **MongoDB Atlas**: Create a cluster and get your connection string
   - Update the `.env` file with your MongoDB URI

4. **Start the application**:
   ```bash
   npm start
   ```

5. **Access the application**:
   - Frontend: `http://localhost:5000`
   - API: `http://localhost:5000/api`

## 🔧 Configuration

### Database Settings
The application uses MongoDB. Configure your database connection in the `.env` file:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/careerpath
NODE_ENV=development
PORT=5000
```

For production deployment on Vercel, set these environment variables in your Vercel dashboard.

### Admin Credentials (Default)
- Username: `admin`
- Password: `admin123`

## 📚 Features

- Student application form
- Merit list display (live updates)
- Admin panel for managing applications
- MySQL database integration
- Responsive web design

## 🛠 Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript (Vanilla JS)
- **Backend**: Node.js, Express.js  
- **Database**: MongoDB with Mongoose ODM
- **Deployment**: Vercel (Serverless)
- **Database Hosting**: MongoDB Atlas (Cloud)
- **Additional**: CORS, Body-Parser, dotenv

## 📖 Documentation

For detailed documentation, see `docs/README.md`.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is for educational purposes.