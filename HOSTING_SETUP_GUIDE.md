# 🚀 CareerPath Hosting Setup Guide

## 🔧 MongoDB Atlas Setup for Hosting

### 1. **Create MongoDB Atlas Account**
1. Go to [MongoDB Atlas](https://cloud.mongodb.com)
2. Create a free account and cluster
3. Create a database called `careerpath`

### 2. **Configure Network Access**
1. In Atlas, go to "Network Access"
2. Add IP Address: `0.0.0.0/0` (allows all IPs)
3. This is required for hosting platforms like Vercel, Netlify

### 3. **Get Connection String**
1. Go to "Database" → "Connect" → "Connect your application"
2. Copy the connection string (MongoDB URI)
3. Replace `<password>` with your actual password
4. Replace `<dbname>` with `careerpath`

Example: `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/careerpath?retryWrites=true&w=majority`

---

## 🌐 Hosting Platform Setup

### **For Vercel Hosting:**

1. **Deploy to Vercel:**
   ```bash
   npm install -g vercel
   vercel
   ```

2. **Add Environment Variables in Vercel:**
   - Go to your project dashboard
   - Settings → Environment Variables
   - Add: `MONGO_URI` = `your_mongodb_connection_string`
   - Add: `NODE_ENV` = `production`

3. **Redeploy:**
   ```bash
   vercel --prod
   ```

### **For Netlify Hosting:**

1. **Deploy to Netlify:**
   - Connect your GitHub repository
   - Build command: `npm run build`
   - Publish directory: `public`

2. **Add Environment Variables:**
   - Site settings → Environment variables
   - Add: `MONGODB_URI` = `your_mongodb_connection_string`
   - Add: `NODE_ENV` = `production`

### **For Render/Railway/Other Hosting:**

1. **Environment Variables to Set:**
   ```
   MONGO_URI=your_mongodb_connection_string
   MONGODB_URI=your_mongodb_connection_string
   DATABASE_URL=your_mongodb_connection_string
   NODE_ENV=production
   PORT=5000
   ```

---

## 🔍 Testing Your Hosted Application

### **1. Check Health Endpoint:**
Visit: `https://your-app.vercel.app/health`

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2026-01-08T...",
  "environment": "production",
  "mongoConnected": true,
  "studentsCount": 5
}
```

### **2. Test Form Submission:**
1. Go to: `https://your-app.vercel.app/form.html`
2. Submit a test application
3. Check for success message with application details

### **3. Test Merit List:**
1. Go to: `https://your-app.vercel.app/merit.html`
2. Verify you see all submitted applications
3. Check real-time updates work

---

## 🐛 Troubleshooting Hosting Issues

### **MongoDB Connection Fails:**
```
❌ MongoDB Connection Error: Could not connect to any servers
```
**Solutions:**
1. Verify MongoDB URI is correct in environment variables
2. Check IP whitelist includes `0.0.0.0/0`
3. Ensure password doesn't contain special characters that need URL encoding

### **No Data Updates:**
```
Using in-memory storage as fallback
```
**Solutions:**
1. Check environment variables are set correctly
2. Verify MongoDB cluster is running
3. Check hosting platform logs for detailed errors

### **API Endpoints Not Working:**
```
Failed to fetch merit list
```
**Solutions:**
1. Verify Vercel deployment was successful
2. Check function logs in hosting dashboard
3. Ensure API endpoints are correctly routed

### **CORS Issues:**
```
Access blocked by CORS policy
```
**Solutions:**
1. Check `vercel.json` configuration
2. Verify CORS origins include your domain
3. Clear browser cache and try again

---

## 📋 Environment Variables Checklist

Make sure these are set in your hosting platform:

- ✅ `MONGO_URI` or `MONGODB_URI` or `DATABASE_URL`
- ✅ `NODE_ENV=production`
- ✅ `PORT=5000` (if required by platform)

---

## 🔗 Platform-Specific URLs

### **Vercel:**
- Main app: `https://your-app.vercel.app`
- Health check: `https://your-app.vercel.app/health`
- Merit API: `https://your-app.vercel.app/api/merit`

### **Netlify:**
- Main app: `https://your-app.netlify.app`
- API endpoints: `https://your-app.netlify.app/api/merit`

---

## ✅ Quick Deployment Commands

### **Vercel:**
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Set environment variables
vercel env add MONGO_URI
vercel env add NODE_ENV

# Deploy to production
vercel --prod
```

### **Railway:**
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway init
railway up
```

---

## 🎯 Expected Results After Hosting

After successful hosting setup:

1. **✅ MongoDB Connected**: Database shows "mongoConnected": true
2. **✅ Form Submissions Work**: New applications are saved and appear in merit list
3. **✅ Real-time Updates**: Merit list updates when new applications are submitted
4. **✅ Persistent Data**: Data persists across server restarts (unlike localhost memory)
5. **✅ Global Access**: Application accessible from anywhere

---

## 📞 Support

If you encounter issues:

1. Check hosting platform logs
2. Verify all environment variables are set
3. Test MongoDB connection separately
4. Check network access settings in MongoDB Atlas

Your application should now work perfectly in hosting environments with persistent data and real-time updates!