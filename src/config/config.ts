// Configuration file for email service and other services
import dotenv from 'dotenv';
dotenv.config();

const IS_PREPROD = process.env.IS_PREPROD === 'true';

export default {
  ZOHO_API_URL: process.env.ZOHO_API_URL || 'https://www.zohoapis.com/crm/v2',
  ZOHO_ACCESS_TOKEN: process.env.ZOHO_ACCESS_TOKEN || '',
  
  // Brevo Configuration (anciennement Sendinblue)
  BREVO_API_KEY: process.env.BREVO_API_KEY,
  BREVO_FROM_EMAIL: process.env.BREVO_FROM_EMAIL || 'no-reply@harx.ai',
  BREVO_FROM_NAME: process.env.BREVO_FROM_NAME || process.env.SMTP_SENDER_NAME || 'HARX',
  
  // Application URL Configuration
  IS_PREPROD: IS_PREPROD,
  BASE_URL: IS_PREPROD ? 'http://localhost:3000' : 'http://localhost:3000'
};

// Log de vérification des variables d'environnement
console.log('Configuration Brevo:', {
  apiKey: process.env.BREVO_API_KEY ? process.env.BREVO_API_KEY.substring(0, 10) + '...' : '***missing***',
  fromEmail: process.env.BREVO_FROM_EMAIL || 'chafik.sabiry@harx.ai',
  fromName: process.env.BREVO_FROM_NAME || 'Harx AI'
});

console.log('Configuration Application:', {
  isPreprod: IS_PREPROD,
  baseUrl: IS_PREPROD ? 'http://localhost:3000' : 'http://localhost:3000'
});

