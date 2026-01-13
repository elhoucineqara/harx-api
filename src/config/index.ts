import dotenv from 'dotenv';

dotenv.config();

const requiredEnvVars = [
  'MONGODB_URI',
  'JWT_SECRET',
];

const optionalEnvVars = [
  'PORT',
  'NODE_ENV',
  'FRONTEND_URL',
  'TWILIO_ACCOUNT_SID',
  'TWILIO_AUTH_TOKEN',
  'ZOHO_CLIENT_ID',
  'OPENAI_API_KEY',
  'GOOGLE_CLOUD_PROJECT_ID',
  'CLOUDINARY_CLOUD_NAME',
  'TELNYX_API_KEY',
  'BREVO_API_KEY',
];

export const validateConfig = () => {
  const missing: string[] = [];
  const warnings: string[] = [];

  requiredEnvVars.forEach((varName) => {
    if (!process.env[varName]) {
      missing.push(varName);
    }
  });

  optionalEnvVars.forEach((varName) => {
    if (!process.env[varName]) {
      warnings.push(varName);
    }
  });

  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:', missing.join(', '));
    console.error('Please check your .env file and ensure all required variables are set.');
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  if (warnings.length > 0 && process.env.NODE_ENV !== 'production') {
    console.warn('⚠️  Optional environment variables not set:', warnings.join(', '));
    console.warn('Some features may not work properly without these variables.');
  }
};

export const config = {
  PORT: parseInt(process.env.PORT, 10),
  NODE_ENV: process.env.NODE_ENV || 'development',

  MONGODB_URI: process.env.MONGODB_URI,

  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRE: process.env.JWT_EXPIRE,

  FRONTEND_URL: process.env.FRONTEND_URL,
  BACKEND_URL: process.env.BACKEND_URL,

  TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID,
  TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN,
  TWILIO_PHONE_NUMBER: process.env.TWILIO_PHONE_NUMBER,

  ZOHO_AUTH_URL: process.env.ZOHO_AUTH_URL,
  ZOHO_CLIENT_ID: process.env.ZOHO_CLIENT_ID,
  ZOHO_CLIENT_SECRET: process.env.ZOHO_CLIENT_SECRET,
  ZOHO_SCOPE: process.env.ZOHO_SCOPE,
  ZOHO_REDIRECT_URI: process.env.ZOHO_REDIRECT_URI,
  ZOHO_TOKEN_URL: process.env.ZOHO_TOKEN_URL,
  ZOHO_API_URL: process.env.ZOHO_API_URL,
  ZOHO_ACCESS_TOKEN: process.env.ZOHO_ACCESS_TOKEN,
  ZOHO_SALESIQ_PORTAL_ID: process.env.ZOHO_SALESIQ_PORTAL_ID,

  OPENAI_API_KEY: process.env.OPENAI_API_KEY,

  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
  CLOUDINARY_UPLOAD_PRESET: process.env.CLOUDINARY_UPLOAD_PRESET,

  GOOGLE_CLOUD_PROJECT_ID: process.env.GOOGLE_CLOUD_PROJECT_ID,
  GOOGLE_CLOUD_LOCATION: process.env.GOOGLE_CLOUD_LOCATION,
  GOOGLE_CLOUD_STORAGE_BUCKET: process.env.GOOGLE_CLOUD_STORAGE_BUCKET,
  GOOGLE_APPLICATION_CREDENTIALS: process.env.GOOGLE_APPLICATION_CREDENTIALS,
  GOOGLE_API_KEY: process.env.GOOGLE_API_KEY,
  GOOGLE_SEARCH_ENGINE_ID: process.env.GOOGLE_SEARCH_ENGINE_ID,

  TELNYX_API_KEY: process.env.TELNYX_API_KEY,
  TELNYX_PUBLIC_KEY: process.env.TELNYX_PUBLIC_KEY,
  TELNYX_APP_ID: process.env.TELNYX_APP_ID,
  TELNYX_API_URL: process.env.TELNYX_API_URL,
  TELNYX_WEBHOOK_URL: process.env.TELNYX_WEBHOOK_URL,

  LINKEDIN_CLIENT_ID: process.env.LINKEDIN_CLIENT_ID,
  LINKEDIN_CLIENT_SECRET: process.env.LINKEDIN_CLIENT_SECRET,

  KNOWLEDGE_BASE_URL: process.env.KNOWLEDGE_BASE_URL,
  SCRIPT_GENERATION_BASE_URL: process.env.SCRIPT_GENERATION_BASE_URL,

  BREVO_API_KEY: process.env.BREVO_API_KEY,
  BREVO_FROM_EMAIL: process.env.BREVO_FROM_EMAIL,
  SMTP_SENDER_NAME: process.env.SMTP_SENDER_NAME,
  DISABLE_EMAIL_SENDING: process.env.DISABLE_EMAIL_SENDING === 'true',

  IS_PREPROD: process.env.IS_PREPROD === 'true',
  REACT_APP_URL: process.env.REACT_APP_URL,
  BASE_URL: process.env.BASE_URL,
};

export default config;
