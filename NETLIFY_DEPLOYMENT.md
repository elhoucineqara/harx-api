# Deploy HARX2 Backend to Netlify

## Important Note

**Netlify is NOT the ideal platform for this Node.js backend** because:
- Netlify Functions have a 10-second timeout limit
- Your backend has long-running operations (calls, AI processing)
- MongoDB connections may timeout in serverless environment

**Recommended platforms instead:**
- **Render.com** (Free tier, perfect for Node.js)
- **Railway.app** (Simple deployment)
- **Heroku** (Classic choice)
- **DigitalOcean App Platform** (Reliable)
- **AWS/Azure/GCP** (Enterprise)

## Alternative: Deploy to Render.com (Recommended)

### Step 1: Create Render Account
1. Go to https://render.com
2. Sign up with GitHub

### Step 2: Create Web Service
1. Click "New +" → "Web Service"
2. Connect your repository
3. Configure:
   - **Name:** harx-backend
   - **Environment:** Node
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `node dist/server.js`
   - **Instance Type:** Free

### Step 3: Add Environment Variables
In Render dashboard, add:
```
NODE_ENV=production
MONGODB_URI=your_mongodb_atlas_uri
JWT_SECRET=your-secure-secret-key
FRONTEND_URL=https://harxv26front.netlify.app
```

### Step 4: Deploy
- Render will auto-deploy
- Get your URL: `https://harx-backend.onrender.com`
- Update frontend to use this URL

## MongoDB Atlas Setup (Required)

Since you're deploying to serverless/cloud, you need MongoDB Atlas:

1. Go to https://www.mongodb.com/cloud/atlas
2. Create free cluster
3. Create database user
4. Whitelist all IPs (0.0.0.0/0) for serverless
5. Get connection string
6. Update MONGODB_URI in environment variables

## Update Frontend

In your frontend, update API URL to:
```javascript
const API_URL = 'https://harx-backend.onrender.com/api'
```

## If You Still Want Netlify (Not Recommended)

### Prerequisites
```bash
npm install -g netlify-cli
npm install serverless-http
```

### Deploy Steps
```bash
# Login to Netlify
netlify login

# Initialize
netlify init

# Set environment variables in Netlify dashboard
netlify env:set MONGODB_URI "your_connection_string"
netlify env:set JWT_SECRET "your_secret"
netlify env:set FRONTEND_URL "https://harxv26front.netlify.app"

# Deploy
netlify deploy --prod
```

### Limitations on Netlify
- ❌ 10-second function timeout
- ❌ No persistent connections
- ❌ Cold starts add latency
- ❌ Not suitable for real-time features
- ❌ File uploads limited

## Quick Fix for Current Error

Your frontend shows:
```
Access to XMLHttpRequest at 'https://harxv26back.netlify.app/api/auth/register'
from origin 'https://harxv26front.netlify.app' has been blocked by CORS
```

**The backend isn't deployed yet!** You need to:

1. **Deploy backend to Render.com** (recommended) or other platform
2. **Update frontend API URL** to match deployed backend
3. **Add frontend URL to CORS** (already done in code)

## Environment Variables Checklist

Make sure these are set in your deployment platform:

**Required:**
- ✅ `MONGODB_URI` - MongoDB Atlas connection string
- ✅ `JWT_SECRET` - Secure random string
- ✅ `NODE_ENV` - Set to "production"
- ✅ `FRONTEND_URL` - Your frontend URL
- ✅ `PORT` - Usually auto-set by platform

**Optional:**
- OpenAI API key
- Twilio credentials
- Zoho credentials
- etc.

## Testing After Deployment

```bash
# Health check
curl https://your-backend-url.onrender.com/health

# Should return:
{"status":"ok","timestamp":"2026-01-12T..."}
```

## Next Steps

1. ✅ Update CORS to allow frontend (already done)
2. ⏳ Deploy backend to Render.com
3. ⏳ Set up MongoDB Atlas
4. ⏳ Configure environment variables
5. ⏳ Update frontend API URL
6. ⏳ Test registration flow

---

**Recommended:** Use Render.com for hassle-free deployment that just works!
