import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

export const config = {
  PORT: process.env.PORT || 3001,
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/harx',
  JWT_SECRET: process.env.JWT_SECRET || 'your-secret-key',
  JWT_EXPIRE: process.env.JWT_EXPIRE || '24h',
  NODE_ENV: process.env.NODE_ENV || 'development',
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',
  
  // Twilio
  TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID,
  TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN,
  TWILIO_PHONE_NUMBER: process.env.TWILIO_PHONE_NUMBER,
  
  // Zoho
  ZOHO_AUTH_URL: process.env.ZOHO_AUTH_URL,
  ZOHO_CLIENT_ID: process.env.ZOHO_CLIENT_ID,
  ZOHO_CLIENT_SECRET: process.env.ZOHO_CLIENT_SECRET,
  ZOHO_SCOPE: process.env.ZOHO_SCOPE,
  ZOHO_REDIRECT_URI: process.env.ZOHO_REDIRECT_URI,
  ZOHO_TOKEN_URL: process.env.ZOHO_TOKEN_URL,
  ZOHO_API_URL: process.env.ZOHO_API_URL,
  ZOHO_SALESIQ_PORTAL_ID: process.env.ZOHO_SALESIQ_PORTAL_ID,
  
  // OpenAI
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  
  // Cloudinary
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
  CLOUDINARY_UPLOAD_PRESET: process.env.CLOUDINARY_UPLOAD_PRESET,
  
  // Google Cloud
  GOOGLE_CLOUD_PROJECT_ID: process.env.GOOGLE_CLOUD_PROJECT_ID,
  GOOGLE_CLOUD_LOCATION: process.env.GOOGLE_CLOUD_LOCATION || 'us-central1',
  GOOGLE_CLOUD_STORAGE_BUCKET: process.env.GOOGLE_CLOUD_STORAGE_BUCKET,
  GOOGLE_APPLICATION_CREDENTIALS: process.env.GOOGLE_APPLICATION_CREDENTIALS,
  
  // Google Search API
  GOOGLE_API_KEY: process.env.GOOGLE_API_KEY,
  GOOGLE_SEARCH_ENGINE_ID: process.env.GOOGLE_SEARCH_ENGINE_ID,
  
  // Telnyx
  TELNYX_API_KEY: process.env.TELNYX_API_KEY,
  telnyxApiKey: process.env.TELNYX_API_KEY, // Alias for compatibility
  TELNYX_PUBLIC_KEY: process.env.TELNYX_PUBLIC_KEY,
  TELNYX_APP_ID: process.env.TELNYX_APP_ID,
  TELNYX_API_URL: process.env.TELNYX_API_URL || 'https://api.telnyx.com/v2',
  TELNYX_WEBHOOK_URL: process.env.TELNYX_WEBHOOK_URL,
  telnyxWebhookSecret: process.env.TELNYX_WEBHOOK_SECRET,
  BASE_URL: process.env.BASE_URL || `http://localhost:${process.env.PORT || 3001}`,
  
  // LinkedIn
  LINKEDIN_CLIENT_ID: process.env.LINKEDIN_CLIENT_ID || process.env.NEXT_PUBLIC_LINKEDIN_CLIENT_ID,
  LINKEDIN_CLIENT_SECRET: process.env.LINKEDIN_CLIENT_SECRET,
  
  // External Services
  KNOWLEDGE_BASE_URL: process.env.KNOWLEDGE_BASE_URL,
  SCRIPT_GENERATION_BASE_URL: process.env.SCRIPT_GENERATION_BASE_URL,
  
  // Email Service (Brevo/Sendinblue)
  BREVO_API_KEY: process.env.BREVO_API_KEY,
  BREVO_FROM_EMAIL: process.env.BREVO_FROM_EMAIL || 'no-reply@harx.ai',
  SMTP_SENDER_NAME: process.env.SMTP_SENDER_NAME || 'HARX',
  DISABLE_EMAIL_SENDING: process.env.DISABLE_EMAIL_SENDING === 'true',

  // Backend URL
  BACKEND_URL: process.env.BACKEND_URL,
  REACT_APP_URL: process.env.REACT_APP_URL,
};

// Export telnyxApiKey as alias for TELNYX_API_KEY (for compatibility)
// export const telnyxApiKey = config.TELNYX_API_KEY;

