# CareerPath — Student Admission Portal

A full-stack web application for student admissions with frontend, backend, and database components.

## 📁 Project Structure

```
CareerPath_Full/
├── .git/                    # Git repository files
├── CNAME                    # Domain configuration
├── README.md                # This file
├── docs/                    # Documentation
│   └── README.md            # Detailed project documentation
├── database/                # Database files
│   └── db.sql               # MySQL database schema and setup
└── src/                     # Source code
    ├── package.json         # Node.js dependencies and scripts
    ├── server.js            # Express.js backend server
    └── public/              # Frontend static files
        ├── index.html       # Homepage
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
Edit the `dbConfig` object in `src/server.js`:
```javascript
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'your_password',
  database: 'careerpath'
};
```

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

- **Frontend**: HTML5, CSS3, JavaScript
- **Backend**: Node.js, Express.js
- **Database**: MySQL
- **Additional**: CORS, Body-Parser

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