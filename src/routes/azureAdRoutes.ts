import express from 'express';
const router = express.Router();
const AzureAdIntegration = require('../../models/azureAdIntegration');
const {
    setupAzureAd,
    getAuthUrl,
    exchangeCodeForToken,
    getAccessToken,
    disconnectAzureAd,
    getAzureAdStatus
} = require('../../services/azureAdService');

// ✅ Setup Azure AD Integration
router.post('/setup', async (req, res) => {
    const { userId, tenantId, clientId, clientSecret, redirectUri } = req.body;

    if (!userId || !tenantId || !clientId || !clientSecret || !redirectUri) {
        return res.status(400).json({ 
            success: false, 
            error: 'Missing required fields. Please provide userId, tenantId, clientId, clientSecret, and redirectUri.' 
        });
    }

    try {
        const integration = await setupAzureAd(userId, tenantId, clientId, clientSecret, redirectUri);
        res.json({ 
            success: true, 
            message: 'Azure AD integration setup successfully!', 
            data: {
                status: integration.status,
                tenantId: integration.tenantId,
                clientId: integration.clientId,
                redirectUri: integration.redirectUri
            }
        });
    } catch (error) {
        console.error('❌ Error setting up Azure AD integration:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to setup Azure AD integration', 
            message: error.message 
        });
    }
});

// ✅ Get Authorization URL
router.get('/auth-url', async (req, res) => {
    const { userId } = req.query;

    if (!userId) {
        return res.status(400).json({ success: false, error: 'User ID is required' });
    }

    try {
        const authUrl = await getAuthUrl(userId);
        res.json({ success: true, authUrl });
    } catch (error) {
        console.error('❌ Error getting Azure AD auth URL:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to get authorization URL', 
            message: error.message 
        });
    }
});

// ✅ Exchange Auth Code for Token
router.post('/exchange-code', async (req, res) => {
    const { userId, code } = req.body;

    if (!userId || !code) {
        return res.status(400).json({ 
            success: false, 
            error: 'Missing required fields. Please provide userId and code.' 
        });
    }

    try {
        const integration = await exchangeCodeForToken(userId, code);
        res.json({ 
            success: true, 
            message: 'Successfully authenticated with Azure AD!', 
            status: integration.status 
        });
    } catch (error) {
        console.error('❌ Error exchanging code for token:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to exchange code for token', 
            message: error.message 
        });
    }
});

// ✅ Get Access Token
router.get('/access-token', async (req, res) => {
    const { userId } = req.query;

    if (!userId) {
        return res.status(400).json({ success: false, error: 'User ID is required' });
    }

    try {
        const accessToken = await getAccessToken(userId);
        res.json({ success: true, accessToken });
    } catch (error) {
        console.error('❌ Error getting access token:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to get access token', 
            message: error.message 
        });
    }
});

// ✅ Disconnect Azure AD
router.post('/disconnect', async (req, res) => {
    const { userId } = req.body;

    if (!userId) {
        return res.status(400).json({ success: false, error: 'User ID is required' });
    }

    try {
        const integration = await disconnectAzureAd(userId);
        res.json({ 
            success: true, 
            message: 'Azure AD disconnected successfully!', 
            status: integration.status 
        });
    } catch (error) {
        console.error('❌ Error disconnecting Azure AD:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to disconnect Azure AD integration', 
            message: error.message 
        });
    }
});

// ✅ Get Azure AD Status
router.get('/status', async (req, res) => {
    const { userId } = req.query;

    if (!userId) {
        return res.status(400).json({ success: false, error: 'User ID is required' });
    }

    try {
        const integration = await AzureAdIntegration.findOne({ userId });
        if (!integration) {
            return res.json({ success: true, status: 'pending' });
        }
        
        const status = await getAzureAdStatus(userId);
        res.json({ success: true, ...status });
    } catch (error) {
        console.error('❌ Error getting Azure AD status:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to fetch Azure AD integration status', 
            message: error.message 
        });
    }
});

export default router; 