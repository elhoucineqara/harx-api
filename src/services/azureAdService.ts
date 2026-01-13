import { ConfidentialClientApplication } from '@azure/msal-node';
import AzureAdIntegration from '../models/AzureAdIntegration';

// Create MSAL client
const createMsalClient = async (userId: any) => {
    const integration = await AzureAdIntegration.findOne({ userId });
    if (!integration) throw new Error('Azure AD integration not found');

    const msalConfig = {
        auth: {
            clientId: integration.clientId,
            clientSecret: integration.clientSecret,
            authority: `https://login.microsoftonline.com/${integration.tenantId}`
        }
    };

    return new ConfidentialClientApplication(msalConfig);
};

// Setup Azure AD Integration
const setupAzureAd = async (userId: any, tenantId: string, clientId: string, clientSecret: string, redirectUri: string) => {
    let integration = await AzureAdIntegration.findOne({ userId });

    if (!integration) {
        integration = new AzureAdIntegration({
            userId,
            tenantId,
            clientId,
            clientSecret,
            redirectUri,
            status: 'connected',
            lastConnectionAt: new Date()
        });
    } else {
        integration.tenantId = tenantId;
        integration.clientId = clientId;
        integration.clientSecret = clientSecret;
        integration.redirectUri = redirectUri;
        integration.status = 'connected';
        integration.lastConnectionAt = new Date();
    }

    await integration.save();
    return integration;
};

// Get authorization URL
const getAuthUrl = async (userId: any) => {
    const integration = await AzureAdIntegration.findOne({ userId });
    if (!integration) throw new Error('Azure AD integration not found');

    const msalClient = await createMsalClient(userId);
    
    const authCodeUrlParameters = {
        scopes: ['https://graph.microsoft.com/.default'],
        redirectUri: integration.redirectUri
    };

    const authUrl = await msalClient.getAuthCodeUrl(authCodeUrlParameters);
    return authUrl;
};

// Exchange auth code for tokens
const exchangeCodeForToken = async (userId: any, authCode: any) => {
    const integration = await AzureAdIntegration.findOne({ userId });
    if (!integration) throw new Error('Azure AD integration not found');

    const msalClient = await createMsalClient(userId);
    
    const tokenRequest = {
        code: authCode,
        scopes: ['https://graph.microsoft.com/.default'],
        redirectUri: integration.redirectUri
    };

    try {
        const response = await msalClient.acquireTokenByCode(tokenRequest);
        
        integration.accessToken = response.accessToken;
        integration.tokenExpiresAt = response.expiresOn || new Date(Date.now() + 3600 * 1000);
        integration.status = 'connected';
        integration.lastConnectionAt = new Date();
        
        await integration.save();
        return integration;
    } catch (error) {
        integration.status = 'failed';
        await integration.save();
        throw error;
    }
};

// Refresh token
const refreshToken = async (userId: any) => {
    const integration = await AzureAdIntegration.findOne({ userId });
    if (!integration) throw new Error('Azure AD integration not found');
    if (!integration.refreshToken) throw new Error('No refresh token available');

    const msalClient = await createMsalClient(userId);
    
    try {
        const silentRequest = {
            scopes: ['https://graph.microsoft.com/.default'],
            refreshToken: integration.refreshToken
        };

        const response = await msalClient.acquireTokenByRefreshToken(silentRequest);
        
        integration.accessToken = response.accessToken;
        integration.tokenExpiresAt = response.expiresOn || new Date(Date.now() + 3600 * 1000);
        integration.status = 'connected';
        integration.lastConnectionAt = new Date();
        
        await integration.save();
        return integration;
    } catch (error) {
        integration.status = 'failed';
        await integration.save();
        throw error;
    }
};

// Get valid access token (refreshes if needed)
const getAccessToken = async (userId: any) => {
    const integration = await AzureAdIntegration.findOne({ userId });
    if (!integration) throw new Error('Azure AD integration not found');

    // Check if token is expired or about to expire (within 5 minutes)
    const isExpired = !integration.tokenExpiresAt || 
                      integration.tokenExpiresAt < new Date(Date.now() + 5 * 60 * 1000);

    if (isExpired && integration.refreshToken) {
        await refreshToken(userId);
        // Fetch the updated integration
        const updatedIntegration = await AzureAdIntegration.findOne({ userId });
        return updatedIntegration.accessToken;
    }

    return integration.accessToken;
};

// Disconnect Azure AD
const disconnectAzureAd = async (userId: any) => {
    const integration = await AzureAdIntegration.findOne({ userId });
    if (!integration) throw new Error('Azure AD integration not found');

    integration.status = 'disconnected';
    await integration.save();
    return integration;
};

// Get Azure AD Integration Status
const getAzureAdStatus = async (userId: any) => {
    const integration = await AzureAdIntegration.findOne({ userId });
    if (!integration) throw new Error('Azure AD integration not found');
    
    return {
        status: integration.status,
        lastConnectionAt: integration.lastConnectionAt
    };
};

export default { 
    setupAzureAd,
    getAuthUrl,
    exchangeCodeForToken,
    refreshToken,
    getAccessToken,
    disconnectAzureAd,
    getAzureAdStatus
 }; 