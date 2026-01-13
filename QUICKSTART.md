# HARX2 Backend - Quick Start Guide

Get your HARX2 backend server running in minutes!

## Prerequisites

- **Node.js** 18 or higher
- **MongoDB** (local or remote instance)
- **npm** or **yarn**

## Quick Setup

### 1. Clone and Install

```bash
# Navigate to project directory
cd harx2-backend

# Install dependencies
npm install
```

### 2. Configure Environment

```bash
# Copy example environment file
cp .env.example .env

# Edit with your configuration
nano .env  # or use any text editor
```

**Minimum Required Configuration:**
```env
MONGODB_URI=mongodb://localhost:27017/harx
JWT_SECRET=your-super-secret-key-here
```

### 3. Start MongoDB (if using local instance)

```bash
# macOS (Homebrew)
brew services start mongodb-community

# Linux (systemd)
sudo systemctl start mongodb

# Windows
net start MongoDB

# Or run manually
mongod --dbpath /path/to/your/data/directory
```

### 4. Build and Run

```bash
# Build TypeScript
npm run build

# Start the server
npm start

# Or use the startup script
./scripts/start.sh
```

### Development Mode

```bash
# Run with auto-reload
npm run dev
```

## Verify Installation

Once started, you should see:

```
🚀 Starting HARX2 Backend Server...
✅ Configuration validated
✅ MongoDB connected
🚀 Backend server running on http://localhost:3001
📋 Environment: development
📊 MongoDB: Local
🌐 Frontend: http://localhost:5173
✨ Server is ready to accept requests!
```

Test the health endpoint:
```bash
curl http://localhost:3001/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2026-01-12T..."
}
```

## Common Issues

### MongoDB Connection Failed

**Problem:** `MongoDB connection failed: connect ECONNREFUSED`

**Solution:**
1. Ensure MongoDB is running: `mongosh` (should connect successfully)
2. Check `MONGODB_URI` in `.env` is correct
3. For remote MongoDB, ensure IP is whitelisted

### Missing Environment Variables

**Problem:** `Missing required environment variables: JWT_SECRET`

**Solution:**
1. Check your `.env` file exists
2. Ensure all required variables are set
3. Copy from `.env.example` if needed

### Port Already in Use

**Problem:** `Error: listen EADDRINUSE: address already in use :::3001`

**Solution:**
```bash
# Find process using port 3001
lsof -i :3001  # macOS/Linux
netstat -ano | findstr :3001  # Windows

# Kill the process or change PORT in .env
PORT=3002
```

## Configuration Options

### Essential
- `MONGODB_URI` - MongoDB connection string (required)
- `JWT_SECRET` - Secret key for JWT tokens (required)
- `PORT` - Server port (default: 3001)
- `NODE_ENV` - Environment mode (development/production)

### Optional Integrations
- `TWILIO_*` - For call functionality
- `ZOHO_*` - For CRM integration
- `OPENAI_API_KEY` - For AI features
- `GOOGLE_CLOUD_*` - For Speech-to-Text and Vertex AI
- `CLOUDINARY_*` - For file uploads

See `.env.example` for complete list.

## API Endpoints

Once running, the API is available at `http://localhost:3001/api/`

Key endpoints:
- `/health` - Health check
- `/api/auth/*` - Authentication
- `/api/agents/*` - Agent management
- `/api/calls/*` - Call handling
- `/api/leads/*` - Lead management

## Next Steps

1. **Frontend Setup:** Configure your frontend to connect to `http://localhost:3001`
2. **API Testing:** Use Postman or curl to test endpoints
3. **Review Documentation:** Check `IMPROVEMENTS.md` for architecture details
4. **Add Integrations:** Configure optional services as needed

## Production Deployment

### Environment Setup
```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/harx
JWT_SECRET=strong-random-secret-minimum-32-characters
FRONTEND_URL=https://yourdomain.com
```

### Build and Deploy
```bash
npm install --production
npm run build
npm start
```

### Using PM2 (Recommended)
```bash
npm install -g pm2
pm2 start dist/server.js --name harx-backend
pm2 save
pm2 startup
```

## Support

- **Configuration Issues:** Check `.env.example` for all options
- **MongoDB Issues:** Verify connection with `mongosh`
- **API Issues:** Check logs in `logs/` directory
- **General Help:** See `IMPROVEMENTS.md` for architecture details

## Resources

- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) - Free cloud MongoDB
- [Postman](https://www.postman.com/) - API testing tool
- [PM2](https://pm2.keymetrics.io/) - Production process manager

---

**Ready to build something amazing!** 🚀
