# HARX2 Backend - Deployment Guide

## Overview
This guide covers deploying the HARX2 backend to various environments.

## Pre-Deployment Checklist

- [ ] All required environment variables configured
- [ ] MongoDB instance accessible
- [ ] Strong JWT secret generated
- [ ] CORS origins configured for production domains
- [ ] SSL certificates obtained (for HTTPS)
- [ ] Monitoring and logging configured

## Environment Variables for Production

```env
# Server
NODE_ENV=production
PORT=3001
BACKEND_URL=https://api.yourdomain.com
FRONTEND_URL=https://app.yourdomain.com,https://www.yourdomain.com
BASE_URL=https://api.yourdomain.com

# Database (REQUIRED)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/harx?retryWrites=true&w=majority

# Authentication (REQUIRED)
JWT_SECRET=your-super-secure-random-string-minimum-32-characters-long
JWT_EXPIRE=24h

# Optional Services (configure as needed)
TWILIO_ACCOUNT_SID=your_production_twilio_sid
TWILIO_AUTH_TOKEN=your_production_twilio_token
OPENAI_API_KEY=your_production_openai_key
# ... other services
```

## Deployment Options

### 1. Traditional VPS/Server (Ubuntu/Debian)

#### Prerequisites
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install MongoDB (or use MongoDB Atlas)
# Follow: https://docs.mongodb.com/manual/tutorial/install-mongodb-on-ubuntu/

# Install PM2 globally
sudo npm install -g pm2
```

#### Deployment Steps
```bash
# Clone repository
git clone <your-repo-url> harx2-backend
cd harx2-backend

# Install dependencies
npm install --production

# Create .env file
nano .env  # Add production configuration

# Build
npm run build

# Start with PM2
pm2 start dist/server.js --name harx-backend
pm2 save
pm2 startup  # Follow instructions to enable auto-start

# Monitor
pm2 logs harx-backend
pm2 monit
```

#### Nginx Configuration (Optional Reverse Proxy)
```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

### 2. Docker Deployment

#### Create Dockerfile
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3001

CMD ["node", "dist/server.js"]
```

#### Create docker-compose.yml
```yaml
version: '3.8'

services:
  backend:
    build: .
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - MONGODB_URI=${MONGODB_URI}
      - JWT_SECRET=${JWT_SECRET}
    env_file:
      - .env
    restart: unless-stopped
    depends_on:
      - mongodb

  mongodb:
    image: mongo:6
    volumes:
      - mongodb_data:/data/db
    restart: unless-stopped

volumes:
  mongodb_data:
```

#### Deploy
```bash
docker-compose up -d
docker-compose logs -f backend
```

### 3. Cloud Platforms

#### Heroku
```bash
# Install Heroku CLI
# Create Heroku app
heroku create harx-backend

# Add MongoDB (Atlas or Heroku addon)
heroku addons:create mongolab

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your-secret

# Deploy
git push heroku main

# View logs
heroku logs --tail
```

#### AWS Elastic Beanstalk
```bash
# Install EB CLI
pip install awsebcli

# Initialize
eb init -p node.js harx-backend

# Create environment
eb create harx-prod

# Deploy
eb deploy

# Configure environment variables in AWS Console
```

#### DigitalOcean App Platform
1. Connect repository
2. Configure build command: `npm run build`
3. Configure run command: `node dist/server.js`
4. Set environment variables
5. Deploy

### 4. Kubernetes (Advanced)

#### kubernetes/deployment.yaml
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: harx-backend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: harx-backend
  template:
    metadata:
      labels:
        app: harx-backend
    spec:
      containers:
      - name: backend
        image: your-registry/harx-backend:latest
        ports:
        - containerPort: 3001
        env:
        - name: NODE_ENV
          value: "production"
        - name: MONGODB_URI
          valueFrom:
            secretKeyRef:
              name: harx-secrets
              key: mongodb-uri
```

## Post-Deployment

### 1. Health Check
```bash
curl https://api.yourdomain.com/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2026-01-12T..."
}
```

### 2. Monitoring Setup

#### PM2 Monitoring (Free)
```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 30
```

#### Application Monitoring
Consider integrating:
- **New Relic** - Application performance monitoring
- **Sentry** - Error tracking
- **DataDog** - Infrastructure monitoring
- **LogRocket** - Session replay and monitoring

### 3. Backup Strategy

#### MongoDB Backups
```bash
# Manual backup
mongodump --uri="your-mongodb-uri" --out=/backups/$(date +%Y%m%d)

# Automated daily backup (cron)
0 2 * * * /usr/bin/mongodump --uri="your-mongodb-uri" --out=/backups/$(date +\%Y\%m\%d)
```

#### MongoDB Atlas
- Automated backups available
- Point-in-time recovery
- Configure in Atlas dashboard

## Security Hardening

### 1. Environment Variables
- Never commit `.env` to version control
- Use secrets management (AWS Secrets Manager, HashiCorp Vault)
- Rotate secrets regularly

### 2. Network Security
```bash
# Firewall rules (ufw example)
sudo ufw allow 22/tcp  # SSH
sudo ufw allow 80/tcp  # HTTP
sudo ufw allow 443/tcp # HTTPS
sudo ufw enable
```

### 3. MongoDB Security
- Enable authentication
- Use strong passwords
- Whitelist IP addresses
- Enable SSL/TLS
- Regular security updates

### 4. Application Security
- Keep dependencies updated: `npm audit fix`
- Use HTTPS only in production
- Implement rate limiting
- Add helmet.js for security headers
- Regular security audits

## Performance Optimization

### 1. Node.js Optimization
```javascript
// server.js additions
app.use(compression()); // Enable gzip compression
app.use(helmet()); // Security headers

// MongoDB connection optimization (already configured)
```

### 2. PM2 Cluster Mode
```bash
# Use all CPU cores
pm2 start dist/server.js -i max --name harx-backend
```

### 3. Caching Strategy
- Implement Redis for session storage
- Cache frequently accessed data
- Use CDN for static assets

### 4. Database Optimization
- Create indexes on frequently queried fields
- Use MongoDB aggregation pipelines
- Regular database maintenance

## Troubleshooting

### Server Won't Start
1. Check logs: `pm2 logs` or `docker logs`
2. Verify environment variables
3. Test MongoDB connection: `mongosh your-uri`
4. Check port availability: `lsof -i :3001`

### High Memory Usage
```bash
# Increase Node.js memory limit
node --max-old-space-size=4096 dist/server.js

# Or with PM2
pm2 start dist/server.js --node-args="--max-old-space-size=4096"
```

### Database Connection Issues
1. Verify MongoDB is running
2. Check firewall rules
3. Verify connection string
4. Check MongoDB Atlas IP whitelist

## Rollback Procedure

### PM2
```bash
# Save current version
pm2 save

# Deploy new version
git pull
npm install
npm run build
pm2 restart harx-backend

# If issues occur, rollback
git reset --hard <previous-commit>
npm install
npm run build
pm2 restart harx-backend
```

### Docker
```bash
# Rollback to previous image
docker-compose down
docker pull your-registry/harx-backend:previous-tag
docker-compose up -d
```

## Maintenance

### Regular Tasks
- [ ] Monitor server logs daily
- [ ] Review error rates and performance metrics
- [ ] Update dependencies monthly
- [ ] Security audit quarterly
- [ ] Database optimization quarterly
- [ ] Review and rotate secrets semi-annually

### Scheduled Maintenance
```bash
# Update dependencies
npm update
npm audit fix

# Rebuild
npm run build

# Restart
pm2 restart harx-backend --update-env
```

## Support and Resources

- **MongoDB Atlas:** https://www.mongodb.com/cloud/atlas
- **PM2 Documentation:** https://pm2.keymetrics.io/docs/usage/quick-start/
- **Node.js Best Practices:** https://github.com/goldbergyoni/nodebestpractices
- **SSL Certificates:** https://letsencrypt.org/

---

**Deployment Status:** Production Ready
**Last Updated:** January 2026
