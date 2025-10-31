# 🚀 Deploy CareerPath to Vercel - Access from Anywhere

## Quick Deployment Steps

### 1. **Sign up/Login to Vercel**
- Go to [vercel.com](https://vercel.com)
- Sign up with your GitHub account
- This will give you free hosting

### 2. **Import Your Repository**
- Click "New Project" in Vercel dashboard
- Select "Import Git Repository"
- Choose your GitHub repository: `pranavpatil1431/CareerPath`
- Click "Import"

### 3. **Configure Environment Variables**
In Vercel dashboard, go to Settings → Environment Variables and add:

```
NODE_ENV=production
MONGODB_URI=mongodb+srv://teju_db_user:patil%400409@cluster0.f54cehb.mongodb.net/careerpath?retryWrites=true&w=majority&appName=Cluster0
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
VERCEL=1
```

### 4. **Deploy**
- Click "Deploy"
- Vercel will automatically build and deploy your app
- You'll get a URL like: `https://careerpath-xxx.vercel.app`

## 🌍 Alternative: Make Local Server Accessible

If you want to keep running locally but access from other devices:

### Option A: Use ngrok (Temporary Public URL)
1. Download [ngrok](https://ngrok.com)
2. Run your server: `npm start`
3. In another terminal: `ngrok http 5000`
4. Get public URL like: `https://xyz123.ngrok.io`

### Option B: Local Network Access
1. Find your computer's IP address: `ipconfig`
2. Start server: `npm start`
3. Access from other devices on same network: `http://YOUR_IP:5000`

## ✅ Recommended: Vercel Deployment

**Why Vercel?**
- ✅ Free hosting
- ✅ Global CDN (fast worldwide)
- ✅ Automatic HTTPS
- ✅ Automatic deployments from GitHub
- ✅ Professional domain
- ✅ MongoDB Atlas integration

**Your app will be accessible at:**
`https://careerpath-[your-username].vercel.app`

## 🔧 If You Need Help

1. **MongoDB Atlas Setup**: Your connection string looks ready
2. **Domain Issues**: Vercel provides free subdomain
3. **Environment Variables**: Critical for production
4. **Build Errors**: Check Vercel build logs

Would you like me to help with any specific step?