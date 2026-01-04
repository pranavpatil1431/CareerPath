# Vercel Environment Variables Setup Guide

## Required Environment Variables for Vercel:

1. **MONGO_URI** - Your MongoDB Atlas connection string
2. **NODE_ENV** - Set to 'production'

## How to Set Environment Variables on Vercel:

### Method 1: Using Vercel CLI
```bash
vercel env add MONGO_URI
# Enter: mongodb+srv://patilteju0409_db_user:Pranavteju%401431@cluster0.ahuv2zd.mongodb.net/careerpath?retryWrites=true&w=majority&appName=Cluster0

vercel env add NODE_ENV
# Enter: production
```

### Method 2: Using Vercel Dashboard
1. Go to https://vercel.com/dashboard
2. Select your project: career-path-rqof
3. Go to Settings → Environment Variables
4. Add:
   - **Name:** MONGO_URI
   - **Value:** mongodb+srv://patilteju0409_db_user:Pranavteju%401431@cluster0.ahuv2zd.mongodb.net/careerpath?retryWrites=true&w=majority&appName=Cluster0
   - **Environments:** Production, Preview, Development

5. Add:
   - **Name:** NODE_ENV  
   - **Value:** production
   - **Environments:** Production, Preview, Development

## After Setting Environment Variables:
```bash
# Redeploy your application
vercel --prod
```

## Testing the Deployment:
- Merit List: https://career-path-rqof.vercel.app/merit.html
- API Status: https://career-path-rqof.vercel.app/api
- Health Check: https://career-path-rqof.vercel.app/health