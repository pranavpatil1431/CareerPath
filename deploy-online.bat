@echo off
echo 🚀 CareerPath Online Database Deployment Script
echo.

echo 📋 Checking prerequisites...
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is not installed or not in PATH
    pause
    exit /b 1
)

npm --version >nul 2>&1
if errorlevel 1 (
    echo ❌ npm is not installed or not in PATH
    pause
    exit /b 1
)

echo ✅ Node.js and npm are available

echo.
echo 📦 Installing dependencies...
npm install

if errorlevel 1 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)

echo ✅ Dependencies installed successfully

echo.
echo 🔧 Environment Setup Check...
if not exist .env (
    echo ⚠️  .env file not found!
    echo Please create .env file with your MongoDB Atlas connection string
    echo Example: MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/careerpath
    pause
    exit /b 1
)

echo ✅ .env file found

echo.
echo 🌐 Testing database connection...
npm run test-db

if errorlevel 1 (
    echo ❌ Database connection test failed
    echo Please check your MongoDB Atlas connection string in .env file
    pause
    exit /b 1
)

echo ✅ Database connection successful

echo.
echo 📊 Migrating initial data to database...
npm run migrate

echo.
echo 🚀 Starting local server for testing...
echo Visit http://localhost:5000 to test your application
echo Press Ctrl+C to stop the server
npm start

pause