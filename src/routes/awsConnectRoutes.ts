import express from 'express';
const router = express.Router();
const AwsConnectIntegration = require('../../models/awsConnectIntegration');
const {
    setupAwsConnect,
    testConnection,
    listPhoneNumbers,
    listUsers,
    listQueues,
    getMetrics,
    disconnectAwsConnect,
    getAwsConnectStatus
} = require('../../services/awsConnectService');

// ✅ Setup AWS Connect Integration
router.post('/setup', async (req, res) => {
    const { userId, accessKeyId, secretAccessKey, region, instanceId } = req.body;

    if (!userId || !accessKeyId || !secretAccessKey || !region || !instanceId) {
        return res.status(400).json({ 
            success: false, 
            error: 'Missing required fields. Please provide userId, accessKeyId, secretAccessKey, region, and instanceId.' 
        });
    }

    try {
        const integration = await setupAwsConnect(userId, accessKeyId, secretAccessKey, region, instanceId);
        res.json({ 
            success: true, 
            message: 'AWS Connect integration setup successfully!', 
            data: {
                status: integration.status,
                region: integration.region,
                instanceId: integration.instanceId
            }
        });
    } catch (error) {
        console.error('❌ Error setting up AWS Connect integration:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to setup AWS Connect integration', 
            message: error.message 
        });
    }
});

// ✅ Test Connection
router.post('/test-connection', async (req, res) => {
    const { userId } = req.body;

    if (!userId) {
        return res.status(400).json({ success: false, error: 'User ID is required' });
    }

    try {
        const result = await testConnection(userId);
        res.json(result);
    } catch (error) {
        console.error('❌ Error testing AWS Connect connection:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to test AWS Connect connection', 
            message: error.message 
        });
    }
});

// ✅ List Phone Numbers
router.get('/phone-numbers', async (req, res) => {
    const { userId, maxResults } = req.query;

    if (!userId) {
        return res.status(400).json({ success: false, error: 'User ID is required' });
    }

    try {
        const phoneNumbers = await listPhoneNumbers(userId, maxResults ? parseInt(maxResults as string) : 10);
        res.json({ success: true, phoneNumbers });
    } catch (error) {
        console.error('❌ Error listing phone numbers:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to list phone numbers', 
            message: error.message 
        });
    }
});

// ✅ List Users
router.get('/users', async (req, res) => {
    const { userId, maxResults } = req.query;

    if (!userId) {
        return res.status(400).json({ success: false, error: 'User ID is required' });
    }

    try {
        const users = await listUsers(userId, maxResults ? parseInt(maxResults as string) : 10);
        res.json({ success: true, users });
    } catch (error) {
        console.error('❌ Error listing users:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to list users', 
            message: error.message 
        });
    }
});

// ✅ List Queues
router.get('/queues', async (req, res) => {
    const { userId, maxResults } = req.query;

    if (!userId) {
        return res.status(400).json({ success: false, error: 'User ID is required' });
    }

    try {
        const queues = await listQueues(userId, maxResults ? parseInt(maxResults as string) : 10);
        res.json({ success: true, queues });
    } catch (error) {
        console.error('❌ Error listing queues:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to list queues', 
            message: error.message 
        });
    }
});

// ✅ Get Metrics
router.get('/metrics', async (req, res) => {
    const { userId, queueIds, startTime, endTime } = req.query;

    if (!userId) {
        return res.status(400).json({ success: false, error: 'User ID is required' });
    }

    try {
        const queueIdsArray = queueIds ? (queueIds as string).split(',') : [];
        const startTimeDate = startTime ? new Date(startTime as string) : null;
        const endTimeDate = endTime ? new Date(endTime as string) : null;
        
        const metrics = await getMetrics(userId, queueIdsArray, startTimeDate, endTimeDate);
        res.json({ success: true, metrics });
    } catch (error) {
        console.error('❌ Error getting metrics:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to get metrics', 
            message: error.message 
        });
    }
});

// ✅ Disconnect AWS Connect
router.post('/disconnect', async (req, res) => {
    const { userId } = req.body;

    if (!userId) {
        return res.status(400).json({ success: false, error: 'User ID is required' });
    }

    try {
        const integration = await disconnectAwsConnect(userId);
        res.json({ 
            success: true, 
            message: 'AWS Connect disconnected successfully!', 
            status: integration.status 
        });
    } catch (error) {
        console.error('❌ Error disconnecting AWS Connect:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to disconnect AWS Connect integration', 
            message: error.message 
        });
    }
});

// ✅ Get AWS Connect Status
router.get('/status', async (req, res) => {
    const { userId } = req.query;

    if (!userId) {
        return res.status(400).json({ success: false, error: 'User ID is required' });
    }

    try {
        const integration = await AwsConnectIntegration.findOne({ userId });
        if (!integration) {
            return res.json({ success: true, status: 'pending' });
        }
        
        const status = await getAwsConnectStatus(userId);
        res.json({ success: true, ...status });
    } catch (error) {
        console.error('❌ Error getting AWS Connect status:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to fetch AWS Connect integration status', 
            message: error.message 
        });
    }
});

export default router; 