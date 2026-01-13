import dotenv from 'dotenv';
dotenv.config();

const zohoConfig = {
    clientId: process.env.ZOHO_CLIENT_ID,
    clientSecret: process.env.ZOHO_CLIENT_SECRET,
    redirectUri: process.env.ZOHO_REDIRECT_URI,
    authUrl: process.env.ZOHO_AUTH_URL || 'https://accounts.zoho.com/oauth/v2/auth',
    tokenUrl: process.env.ZOHO_TOKEN_URL || 'https://accounts.zoho.com/oauth/v2/token',
    apiBaseUrl: process.env.ZOHO_API_URL || 'https://www.zohoapis.com/crm/v2',
    scope: process.env.ZOHO_SCOPE || 'ZohoCRM.modules.ALL',
    salesIqPortalId: process.env.ZOHO_SALESIQ_PORTAL_ID,
};

export default zohoConfig;
