import express from 'express';
const router = express.Router();
const GoogleAnalyticsIntegration = require('../../models/googleAnalyticsIntegration');
const {
    setupGoogleAnalytics,
    getAccessToken,
    listAccounts,
    listProperties,
    listViews,
    getReportData,
    getGA4Data,
    disconnectGoogleAnalytics,
    getGoogleAnalyticsStatus
} = require('../../services/googleAnalyticsService');

// ✅ Setup Google Analytics Integration
router.post('/setup', async (req, res) => {
    const { userId, clientId, clientSecret, refreshToken, viewId, isGA4, measurementId, apiSecret } = req.body;

    if (!userId || !clientId || !clientSecret || !refreshToken) {
        return res.status(400).json({ 
            success: false, 
            error: 'Missing required fields. Please provide userId, clientId, clientSecret, and refreshToken.' 
        });
    }

    try {
        const integration = await setupGoogleAnalytics(
            userId, 
            clientId, 
            clientSecret, 
            refreshToken, 
            viewId, 
            isGA4, 
            measurementId, 
            apiSecret
        );
        
        res.json({ 
            success: true, 
            message: 'Google Analytics integration setup successfully!', 
            data: {
                status: integration.status,
                isGA4: integration.isGA4,
                viewId: integration.viewId,
                measurementId: integration.measurementId
            }
        });
    } catch (error) {
        console.error('❌ Error setting up Google Analytics integration:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to setup Google Analytics integration', 
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

// ✅ List Accounts
router.get('/accounts', async (req, res) => {
    const { userId } = req.query;

    if (!userId) {
        return res.status(400).json({ success: false, error: 'User ID is required' });
    }

    try {
        const accounts = await listAccounts(userId);
        res.json({ success: true, accounts });
    } catch (error) {
        console.error('❌ Error listing accounts:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to list accounts', 
            message: error.message 
        });
    }
});

// ✅ List Properties
router.get('/properties', async (req, res) => {
    const { userId, accountId } = req.query;

    if (!userId || !accountId) {
        return res.status(400).json({ 
            success: false, 
            error: 'Missing required fields. Please provide userId and accountId.' 
        });
    }

    try {
        const properties = await listProperties(userId, accountId);
        res.json({ success: true, properties });
    } catch (error) {
        console.error('❌ Error listing properties:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to list properties', 
            message: error.message 
        });
    }
});

// ✅ List Views
router.get('/views', async (req, res) => {
    const { userId, accountId, propertyId } = req.query;

    if (!userId || !accountId || !propertyId) {
        return res.status(400).json({ 
            success: false, 
            error: 'Missing required fields. Please provide userId, accountId, and propertyId.' 
        });
    }

    try {
        const views = await listViews(userId, accountId, propertyId);
        res.json({ success: true, views });
    } catch (error) {
        console.error('❌ Error listing views:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to list views', 
            message: error.message 
        });
    }
});

// ✅ Get Report Data (Universal Analytics)
router.get('/report', async (req, res) => {
    const { userId, metrics, dimensions, startDate, endDate } = req.query;

    if (!userId) {
        return res.status(400).json({ success: false, error: 'User ID is required' });
    }

    try {
        const metricsArray = metrics ? (metrics as string).split(',') : ['ga:sessions', 'ga:users'];
        const dimensionsArray = dimensions ? (dimensions as string).split(',') : ['ga:date'];
        
        const report = await getReportData(
            userId, 
            metricsArray, 
            dimensionsArray, 
            startDate || '7daysAgo', 
            endDate || 'today'
        );
        
        res.json({ success: true, report });
    } catch (error) {
        console.error('❌ Error getting report data:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to get report data', 
            message: error.message 
        });
    }
});

// ✅ Get GA4 Data
router.get('/ga4-data', async (req, res) => {
    const { userId, metrics, dimensions, startDate, endDate } = req.query;

    if (!userId) {
        return res.status(400).json({ success: false, error: 'User ID is required' });
    }

    try {
        const metricsArray = metrics ? (metrics as string).split(',') : ['activeUsers'];
        const dimensionsArray = dimensions ? (dimensions as string).split(',') : ['date'];
        
        const data = await getGA4Data(
            userId, 
            metricsArray, 
            dimensionsArray, 
            startDate || '7daysAgo', 
            endDate || 'today'
        );
        
        res.json({ success: true, data });
    } catch (error) {
        console.error('❌ Error getting GA4 data:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to get GA4 data', 
            message: error.message 
        });
    }
});

// ✅ Disconnect Google Analytics
router.post('/disconnect', async (req, res) => {
    const { userId } = req.body;

    if (!userId) {
        return res.status(400).json({ success: false, error: 'User ID is required' });
    }

    try {
        const integration = await disconnectGoogleAnalytics(userId);
        res.json({ 
            success: true, 
            message: 'Google Analytics disconnected successfully!', 
            status: integration.status 
        });
    } catch (error) {
        console.error('❌ Error disconnecting Google Analytics:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to disconnect Google Analytics integration', 
            message: error.message 
        });
    }
});

// ✅ Get Google Analytics Status
router.get('/status', async (req, res) => {
    const { userId } = req.query;

    if (!userId) {
        return res.status(400).json({ success: false, error: 'User ID is required' });
    }

    try {
        const integration = await GoogleAnalyticsIntegration.findOne({ userId });
        if (!integration) {
            return res.json({ success: true, status: 'pending' });
        }
        
        const status = await getGoogleAnalyticsStatus(userId);
        res.json({ success: true, ...status });
    } catch (error) {
        console.error('❌ Error getting Google Analytics status:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to fetch Google Analytics integration status', 
            message: error.message 
        });
    }
});

export default router; 