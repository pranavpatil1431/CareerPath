# 🚀 CareerPath Deployment Guide

## Prerequisites for Vercel Deployment

### 1. MongoDB Atlas Setup
1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a new cluster
3. Create a database user with read/write permissions
4. Get your connection string (should look like): 
   ```
   mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority
   ```

### 2. Vercel Environment Variables
In your Vercel dashboard, add these environment variables:

```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://your-username:your-password@your-cluster.mongodb.net/careerpath?retryWrites=true&w=majority
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
VERCEL=1
```

## Deployment Steps

### Method 1: GitHub Integration (Recommended)
1. Push your code to GitHub
2. Connect your GitHub repo to Vercel
3. Set the environment variables in Vercel dashboard
4. Deploy automatically

### Method 2: Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

## Post-Deployment Checklist

### 1. Test API Endpoints
- `GET /api` - Should return API status
- `POST /apply` - Test form submission
- `GET /merit` - Test merit list
- `GET /students` - Test student list
- `POST /admin/login` - Test admin login

### 2. Test Frontend Pages
- `/` - Home page
- `/form.html` - Application form
- `/merit.html` - Merit list
- `/admin.html` - Admin panel
- `/admission.html` - Admission process
- `/courses.html` - Courses & syllabus
- `/exams.html` - Entrance exams
- `/colleges.html` - Colleges
- `/allotment.html` - Allotment process

### 3. Common Issues & Solutions

#### Issue: "Cannot connect to MongoDB"
**Solution**: Check your MONGODB_URI environment variable in Vercel dashboard

#### Issue: "Static files not loading"
**Solution**: Check vercel.json routing configuration

#### Issue: "API endpoints return 404"
**Solution**: Verify all routes are properly configured in vercel.json

#### Issue: "Form submission fails"
**Solution**: Check CORS configuration and API endpoints

## Environment Variables Reference

```env
# Required for production
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/careerpath
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
VERCEL=1

# Optional
PORT=3000 (Vercel handles this automatically)
```

## Local Development

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your local MongoDB URI

# Start development server
npm run dev
# or
npm start
```

## Troubleshooting

### Check Vercel Function Logs
1. Go to your Vercel dashboard
2. Click on your deployment
3. Click "Functions" tab
4. Check logs for any errors

### Test Individual Components
```bash
# Test MongoDB connection
node -e "import mongoose from 'mongoose'; mongoose.connect('your-uri').then(() => console.log('Connected')).catch(console.error)"

# Test API locally
curl -X GET http://localhost:5000/api
```

### Update Dependencies
```bash
npm update
npm audit fix
```

## Support

If you encounter issues:
1. Check Vercel function logs
2. Verify environment variables
3. Test locally first
4. Check MongoDB Atlas connectivity
5. Ensure all routes in vercel.json are correct