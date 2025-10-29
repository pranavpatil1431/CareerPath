#!/bin/bash
# Setup script for CareerPath project

echo "🚀 Setting up CareerPath project..."

# Navigate to src directory
cd src

# Install dependencies
echo "📦 Installing Node.js dependencies..."
npm install

echo "✅ Dependencies installed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Set up your MySQL database using database/db.sql"
echo "2. Copy src/.env.example to src/.env and update database credentials"
echo "3. Run 'npm start' from the src directory to start the server"
echo "4. Access the application at http://localhost:5000/public/index.html"
echo ""
echo "🔧 Default admin credentials:"
echo "   Username: admin"
echo "   Password: admin123"