@echo off
REM Setup script for CareerPath project (Windows)

echo 🚀 Setting up CareerPath project...

REM Navigate to src directory
cd src

REM Install dependencies
echo 📦 Installing Node.js dependencies...
npm install

echo ✅ Dependencies installed successfully!
echo.
echo 📋 Next steps:
echo 1. Set up your MySQL database using database/db.sql
echo 2. Copy src/.env.example to src/.env and update database credentials
echo 3. Run 'npm start' from the src directory to start the server
echo 4. Access the application at http://localhost:5000/public/index.html
echo.
echo 🔧 Default admin credentials:
echo    Username: admin
echo    Password: admin123

pause