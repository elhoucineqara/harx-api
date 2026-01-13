#!/usr/bin/env node

/**
 * Script pour créer le fichier .env depuis .env.example
 */

const fs = require('fs');
const path = require('path');

const envExamplePath = path.join(__dirname, '.env.example');
const envPath = path.join(__dirname, '.env');

if (fs.existsSync(envPath)) {
  console.log('⚠️  Le fichier .env existe déjà.');
  console.log('   Supprimez-le d\'abord si vous voulez le recréer.');
  process.exit(0);
}

if (!fs.existsSync(envExamplePath)) {
  console.log('❌ Le fichier .env.example n\'existe pas.');
  console.log('   Création d\'un fichier .env avec les valeurs par défaut...');
  
  const defaultEnv = `# HARX2 Backend - Environment Variables

# ============================================
# Server Configuration
# ============================================
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# ============================================
# Database
# ============================================
MONGODB_URI=mongodb://harx:ix5S3vU6BjKn4MHp@207.180.226.2:27017/V25_HarxPreProd

# ============================================
# Authentication & Security
# ============================================
JWT_SECRET=your_jwt_secret_key_here_change_in_production

# ============================================
# Twilio (OTP & Telephony)
# ============================================
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=+1234567890

# ============================================
# Zoho CRM Integration
# ============================================
ZOHO_CLIENT_ID=your_zoho_client_id
ZOHO_CLIENT_SECRET=your_zoho_client_secret
ZOHO_REDIRECT_URI=http://localhost:3001/api/zoho/callback
ZOHO_TOKEN_URL=https://accounts.zoho.com/oauth/v2/token

# ============================================
# Cloudinary (File Uploads)
# ============================================
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLOUDINARY_UPLOAD_PRESET=your_upload_preset

# ============================================
# OpenAI
# ============================================
OPENAI_API_KEY=your_openai_api_key

# ============================================
# Google Cloud (Vertex AI & Storage)
# ============================================
GOOGLE_CLOUD_PROJECT_ID=your_google_cloud_project_id
GOOGLE_CLOUD_LOCATION=us-central1
GOOGLE_CLOUD_STORAGE_BUCKET=harx-audios-test
GOOGLE_APPLICATION_CREDENTIALS=path/to/service-account-key.json

# ============================================
# Telnyx (Phone Numbers - Optional)
# ============================================
TELNYX_API_KEY=your_telnyx_api_key
TELNYX_API_URL=https://api.telnyx.com/v2

# ============================================
# External Services (Optional)
# ============================================
KNOWLEDGE_BASE_URL=http://localhost:3004
SCRIPT_GENERATION_BASE_URL=http://localhost:3005
`;

  fs.writeFileSync(envPath, defaultEnv);
  console.log('✅ Fichier .env créé avec les valeurs par défaut.');
  console.log('⚠️  N\'oubliez pas de modifier les valeurs avec vos vraies clés API!');
} else {
  const content = fs.readFileSync(envExamplePath, 'utf-8');
  fs.writeFileSync(envPath, content);
  console.log('✅ Fichier .env créé depuis .env.example');
  console.log('⚠️  N\'oubliez pas de modifier les valeurs avec vos vraies clés API!');
}



