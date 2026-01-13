import express from 'express';
const router = express.Router();
const AwsSnsIntegration = require('../../models/awsSnsIntegration');
const {
    setupAwsSns,
    testConnection,
    listTopics,
    getTopicAttributes,
    createTopic,
    deleteTopic,
    listSubscriptions,
    subscribe,
    unsubscribe,
    publishToTopic,
    sendSms,
    checkIfPhoneNumberIsOptedOut,
    listPhoneNumbersOptedOut,
    setSmsAttributes,
    getSmsAttributes,
    disconnectAwsSns,
    getAwsSnsStatus
} = require('../../services/awsSnsService');

// ✅ Setup AWS SNS Integration
router.post('/setup', async (req, res) => {
    const { userId, accessKeyId, secretAccessKey, region } = req.body;

    if (!userId || !accessKeyId || !secretAccessKey || !region) {
        return res.status(400).json({ 
            success: false, 
            error: 'Missing required fields. Please provide userId, accessKeyId, secretAccessKey, and region.' 
        });
    }

    try {
        const integration = await setupAwsSns(userId, accessKeyId, secretAccessKey, region);
        res.json({ 
            success: true, 
            message: 'AWS SNS integration setup successfully!', 
            data: {
                status: integration.status,
                region: integration.region
            }
        });
    } catch (error) {
        console.error('❌ Error setting up AWS SNS integration:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to setup AWS SNS integration', 
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
        console.error('❌ Error testing AWS SNS connection:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to test AWS SNS connection', 
            message: error.message 
        });
    }
});

// ✅ List Topics
router.get('/topics', async (req, res) => {
    const { userId } = req.query;

    if (!userId) {
        return res.status(400).json({ success: false, error: 'User ID is required' });
    }

    try {
        const topics = await listTopics(userId);
        res.json({ success: true, topics });
    } catch (error) {
        console.error('❌ Error listing topics:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to list topics', 
            message: error.message 
        });
    }
});

// ✅ Get Topic Attributes
router.get('/topics/:topicArn/attributes', async (req, res) => {
    const { userId } = req.query;
    const { topicArn } = req.params;

    if (!userId || !topicArn) {
        return res.status(400).json({ 
            success: false, 
            error: 'Missing required fields. Please provide userId and topicArn.' 
        });
    }

    try {
        const attributes = await getTopicAttributes(userId, topicArn);
        res.json({ success: true, attributes });
    } catch (error) {
        console.error('❌ Error getting topic attributes:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to get topic attributes', 
            message: error.message 
        });
    }
});

// ✅ Create Topic
router.post('/topics', async (req, res) => {
    const { userId, name, attributes } = req.body;

    if (!userId || !name) {
        return res.status(400).json({ 
            success: false, 
            error: 'Missing required fields. Please provide userId and name.' 
        });
    }

    try {
        const topic = await createTopic(userId, name, attributes);
        res.json({ success: true, topic });
    } catch (error) {
        console.error('❌ Error creating topic:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to create topic', 
            message: error.message 
        });
    }
});

// ✅ Delete Topic
router.delete('/topics/:topicArn', async (req, res) => {
    const { userId } = req.query;
    const { topicArn } = req.params;

    if (!userId || !topicArn) {
        return res.status(400).json({ 
            success: false, 
            error: 'Missing required fields. Please provide userId and topicArn.' 
        });
    }

    try {
        await deleteTopic(userId, topicArn);
        res.json({ success: true, message: 'Topic deleted successfully' });
    } catch (error) {
        console.error('❌ Error deleting topic:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to delete topic', 
            message: error.message 
        });
    }
});

// ✅ List Subscriptions
router.get('/subscriptions', async (req, res) => {
    const { userId, topicArn } = req.query;

    if (!userId) {
        return res.status(400).json({ success: false, error: 'User ID is required' });
    }

    try {
        const subscriptions = await listSubscriptions(userId, topicArn);
        res.json({ success: true, subscriptions });
    } catch (error) {
        console.error('❌ Error listing subscriptions:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to list subscriptions', 
            message: error.message 
        });
    }
});

// ✅ Subscribe
router.post('/subscribe', async (req, res) => {
    const { userId, topicArn, protocol, endpoint, attributes } = req.body;

    if (!userId || !topicArn || !protocol || !endpoint) {
        return res.status(400).json({ 
            success: false, 
            error: 'Missing required fields. Please provide userId, topicArn, protocol, and endpoint.' 
        });
    }

    try {
        const subscription = await subscribe(userId, topicArn, protocol, endpoint, attributes);
        res.json({ success: true, subscription });
    } catch (error) {
        console.error('❌ Error subscribing to topic:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to subscribe to topic', 
            message: error.message 
        });
    }
});

// ✅ Unsubscribe
router.post('/unsubscribe', async (req, res) => {
    const { userId, subscriptionArn } = req.body;

    if (!userId || !subscriptionArn) {
        return res.status(400).json({ 
            success: false, 
            error: 'Missing required fields. Please provide userId and subscriptionArn.' 
        });
    }

    try {
        await unsubscribe(userId, subscriptionArn);
        res.json({ success: true, message: 'Unsubscribed successfully' });
    } catch (error) {
        console.error('❌ Error unsubscribing:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to unsubscribe', 
            message: error.message 
        });
    }
});

// ✅ Publish to Topic
router.post('/publish', async (req, res) => {
    const { userId, topicArn, message, subject, messageAttributes } = req.body;

    if (!userId || !message) {
        return res.status(400).json({ 
            success: false, 
            error: 'Missing required fields. Please provide userId and message.' 
        });
    }

    try {
        const result = await publishToTopic(userId, topicArn, message, subject, messageAttributes);
        res.json({ success: true, messageId: result.MessageId });
    } catch (error) {
        console.error('❌ Error publishing to topic:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to publish to topic', 
            message: error.message 
        });
    }
});

// ✅ Send SMS
router.post('/send-sms', async (req, res) => {
    const { userId, phoneNumber, message, messageAttributes } = req.body;

    if (!userId || !phoneNumber || !message) {
        return res.status(400).json({ 
            success: false, 
            error: 'Missing required fields. Please provide userId, phoneNumber, and message.' 
        });
    }

    try {
        const result = await sendSms(userId, phoneNumber, message, messageAttributes);
        res.json({ success: true, messageId: result.MessageId });
    } catch (error) {
        console.error('❌ Error sending SMS:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to send SMS', 
            message: error.message 
        });
    }
});

// ✅ Check If Phone Number Is Opted Out
router.get('/phone-number-opted-out', async (req, res) => {
    const { userId, phoneNumber } = req.query;

    if (!userId || !phoneNumber) {
        return res.status(400).json({ 
            success: false, 
            error: 'Missing required fields. Please provide userId and phoneNumber.' 
        });
    }

    try {
        const isOptedOut = await checkIfPhoneNumberIsOptedOut(userId, phoneNumber);
        res.json({ success: true, isOptedOut });
    } catch (error) {
        console.error('❌ Error checking if phone number is opted out:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to check if phone number is opted out', 
            message: error.message 
        });
    }
});

// ✅ List Phone Numbers Opted Out
router.get('/phone-numbers-opted-out', async (req, res) => {
    const { userId } = req.query;

    if (!userId) {
        return res.status(400).json({ success: false, error: 'User ID is required' });
    }

    try {
        const phoneNumbers = await listPhoneNumbersOptedOut(userId);
        res.json({ success: true, phoneNumbers });
    } catch (error) {
        console.error('❌ Error listing phone numbers opted out:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to list phone numbers opted out', 
            message: error.message 
        });
    }
});

// ✅ Set SMS Attributes
router.post('/sms-attributes', async (req, res) => {
    const { userId, attributes } = req.body;

    if (!userId || !attributes) {
        return res.status(400).json({ 
            success: false, 
            error: 'Missing required fields. Please provide userId and attributes.' 
        });
    }

    try {
        await setSmsAttributes(userId, attributes);
        res.json({ success: true, message: 'SMS attributes set successfully' });
    } catch (error) {
        console.error('❌ Error setting SMS attributes:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to set SMS attributes', 
            message: error.message 
        });
    }
});

// ✅ Get SMS Attributes
router.get('/sms-attributes', async (req, res) => {
    const { userId } = req.query;

    if (!userId) {
        return res.status(400).json({ success: false, error: 'User ID is required' });
    }

    try {
        const attributes = await getSmsAttributes(userId);
        res.json({ success: true, attributes });
    } catch (error) {
        console.error('❌ Error getting SMS attributes:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to get SMS attributes', 
            message: error.message 
        });
    }
});

// ✅ Disconnect AWS SNS
router.post('/disconnect', async (req, res) => {
    const { userId } = req.body;

    if (!userId) {
        return res.status(400).json({ success: false, error: 'User ID is required' });
    }

    try {
        const integration = await disconnectAwsSns(userId);
        res.json({ 
            success: true, 
            message: 'AWS SNS disconnected successfully!', 
            status: integration.status 
        });
    } catch (error) {
        console.error('❌ Error disconnecting AWS SNS:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to disconnect AWS SNS integration', 
            message: error.message 
        });
    }
});

// ✅ Get AWS SNS Status
router.get('/status', async (req, res) => {
    const { userId } = req.query;

    if (!userId) {
        return res.status(400).json({ success: false, error: 'User ID is required' });
    }

    try {
        const integration = await AwsSnsIntegration.findOne({ userId });
        if (!integration) {
            return res.json({ success: true, status: 'pending' });
        }
        
        const status = await getAwsSnsStatus(userId);
        res.json({ success: true, ...status });
    } catch (error) {
        console.error('❌ Error getting AWS SNS status:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to fetch AWS SNS integration status', 
            message: error.message 
        });
    }
});

export default router; 