import express from 'express';
const router = express.Router();
import LiveChatIntegration from '../models/LiveChatIntegration';
import liveChatService from '../services/liveChatService';

const {
    setupLiveChat,
    refreshToken,
    testConnection,
    getAgents,
    getAgent,
    getChats,
    getChat,
    sendChatMessage,
    getCustomers,
    getCustomer,
    createCustomer,
    updateCustomer,
    getCannedResponses,
    createCannedResponse,
    disconnectLiveChat,
    getLiveChatStatus
} = liveChatService;

// ✅ Setup LiveChat Integration
router.post('/setup', async (req, res) => {
    const { userId, clientId, clientSecret, accessToken, refreshToken, accountId } = req.body;

    if (!userId || !clientId || !clientSecret || !accessToken || !refreshToken) {
        return res.status(400).json({ 
            success: false, 
            error: 'Missing required fields. Please provide userId, clientId, clientSecret, accessToken, and refreshToken.' 
        });
    }

    try {
        const integration = await setupLiveChat(userId, clientId, clientSecret, accessToken, refreshToken, accountId);
        res.json({ 
            success: true, 
            message: 'LiveChat integration setup successfully!', 
            data: {
                status: integration.status,
                accountId: integration.accountId,
                tokenExpiresAt: integration.tokenExpiresAt
            }
        });
    } catch (error) {
        console.error('❌ Error setting up LiveChat integration:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to setup LiveChat integration', 
            message: error.message 
        });
    }
});

// ✅ Refresh Token
router.post('/refresh-token', async (req, res) => {
    const { userId } = req.body;

    if (!userId) {
        return res.status(400).json({ success: false, error: 'User ID is required' });
    }

    try {
        const integration = await refreshToken(userId);
        res.json({ 
            success: true, 
            message: 'Token refreshed successfully!', 
            tokenExpiresAt: integration.tokenExpiresAt 
        });
    } catch (error) {
        console.error('❌ Error refreshing token:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to refresh token', 
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
        console.error('❌ Error testing LiveChat connection:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to test LiveChat connection', 
            message: error.message 
        });
    }
});

// ✅ Get Agents
router.get('/agents', async (req, res) => {
    const { userId } = req.query;

    if (!userId) {
        return res.status(400).json({ success: false, error: 'User ID is required' });
    }

    try {
        const agents = await getAgents(userId);
        res.json({ success: true, agents });
    } catch (error) {
        console.error('❌ Error getting agents:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to get agents', 
            message: error.message 
        });
    }
});

// ✅ Get Agent
router.get('/agents/:agentId', async (req, res) => {
    const { userId } = req.query;
    const { agentId } = req.params;

    if (!userId || !agentId) {
        return res.status(400).json({ 
            success: false, 
            error: 'Missing required fields. Please provide userId and agentId.' 
        });
    }

    try {
        const agent = await getAgent(userId, agentId);
        res.json({ success: true, agent });
    } catch (error) {
        console.error('❌ Error getting agent:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to get agent', 
            message: error.message 
        });
    }
});

// ✅ Get Chats
router.get('/chats', async (req, res) => {
    const { userId, ...filters } = req.query;

    if (!userId) {
        return res.status(400).json({ success: false, error: 'User ID is required' });
    }

    try {
        const chats = await getChats(userId, filters);
        res.json({ success: true, chats });
    } catch (error) {
        console.error('❌ Error getting chats:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to get chats', 
            message: error.message 
        });
    }
});

// ✅ Get Chat
router.get('/chats/:chatId', async (req, res) => {
    const { userId } = req.query;
    const { chatId } = req.params;

    if (!userId || !chatId) {
        return res.status(400).json({ 
            success: false, 
            error: 'Missing required fields. Please provide userId and chatId.' 
        });
    }

    try {
        const chat = await getChat(userId, chatId);
        res.json({ success: true, chat });
    } catch (error) {
        console.error('❌ Error getting chat:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to get chat', 
            message: error.message 
        });
    }
});

// ✅ Send Chat Message
router.post('/chats/:chatId/message', async (req, res) => {
    const { userId, message } = req.body;
    const { chatId } = req.params;

    if (!userId || !chatId || !message) {
        return res.status(400).json({ 
            success: false, 
            error: 'Missing required fields. Please provide userId, chatId, and message.' 
        });
    }

    try {
        const result = await sendChatMessage(userId, chatId, message);
        res.json({ success: true, result });
    } catch (error) {
        console.error('❌ Error sending chat message:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to send chat message', 
            message: error.message 
        });
    }
});

// ✅ Get Customers
router.get('/customers', async (req, res) => {
    const { userId, ...filters } = req.query;

    if (!userId) {
        return res.status(400).json({ success: false, error: 'User ID is required' });
    }

    try {
        const customers = await getCustomers(userId, filters);
        res.json({ success: true, customers });
    } catch (error) {
        console.error('❌ Error getting customers:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to get customers', 
            message: error.message 
        });
    }
});

// ✅ Get Customer
router.get('/customers/:customerId', async (req, res) => {
    const { userId } = req.query;
    const { customerId } = req.params;

    if (!userId || !customerId) {
        return res.status(400).json({ 
            success: false, 
            error: 'Missing required fields. Please provide userId and customerId.' 
        });
    }

    try {
        const customer = await getCustomer(userId, customerId);
        res.json({ success: true, customer });
    } catch (error) {
        console.error('❌ Error getting customer:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to get customer', 
            message: error.message 
        });
    }
});

// ✅ Create Customer
router.post('/customers', async (req, res) => {
    const { userId, customerData } = req.body;

    if (!userId || !customerData) {
        return res.status(400).json({ 
            success: false, 
            error: 'Missing required fields. Please provide userId and customerData.' 
        });
    }

    try {
        const customer = await createCustomer(userId, customerData);
        res.json({ success: true, customer });
    } catch (error) {
        console.error('❌ Error creating customer:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to create customer', 
            message: error.message 
        });
    }
});

// ✅ Update Customer
router.put('/customers/:customerId', async (req, res) => {
    const { userId, customerData } = req.body;
    const { customerId } = req.params;

    if (!userId || !customerId || !customerData) {
        return res.status(400).json({ 
            success: false, 
            error: 'Missing required fields. Please provide userId, customerId, and customerData.' 
        });
    }

    try {
        const customer = await updateCustomer(userId, customerId, customerData);
        res.json({ success: true, customer });
    } catch (error) {
        console.error('❌ Error updating customer:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to update customer', 
            message: error.message 
        });
    }
});

// ✅ Get Canned Responses
router.get('/canned-responses', async (req, res) => {
    const { userId } = req.query;

    if (!userId) {
        return res.status(400).json({ success: false, error: 'User ID is required' });
    }

    try {
        const cannedResponses = await getCannedResponses(userId);
        res.json({ success: true, cannedResponses });
    } catch (error) {
        console.error('❌ Error getting canned responses:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to get canned responses', 
            message: error.message 
        });
    }
});

// ✅ Create Canned Response
router.post('/canned-responses', async (req, res) => {
    const { userId, responseData } = req.body;

    if (!userId || !responseData) {
        return res.status(400).json({ 
            success: false, 
            error: 'Missing required fields. Please provide userId and responseData.' 
        });
    }

    try {
        const cannedResponse = await createCannedResponse(userId, responseData);
        res.json({ success: true, cannedResponse });
    } catch (error) {
        console.error('❌ Error creating canned response:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to create canned response', 
            message: error.message 
        });
    }
});

// ✅ Disconnect LiveChat
router.post('/disconnect', async (req, res) => {
    const { userId } = req.body;

    if (!userId) {
        return res.status(400).json({ success: false, error: 'User ID is required' });
    }

    try {
        const integration = await disconnectLiveChat(userId);
        res.json({ 
            success: true, 
            message: 'LiveChat disconnected successfully!', 
            status: integration.status 
        });
    } catch (error) {
        console.error('❌ Error disconnecting LiveChat:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to disconnect LiveChat integration', 
            message: error.message 
        });
    }
});

// ✅ Get LiveChat Status
router.get('/status', async (req, res) => {
    const { userId } = req.query;

    if (!userId) {
        return res.status(400).json({ success: false, error: 'User ID is required' });
    }

    try {
        const integration = await LiveChatIntegration.findOne({ userId });
        if (!integration) {
            return res.json({ success: true, status: 'pending' });
        }
        
        const status = await getLiveChatStatus(userId);
        res.json({ success: true, ...status });
    } catch (error) {
        console.error('❌ Error getting LiveChat status:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to fetch LiveChat integration status', 
            message: error.message 
        });
    }
});

export default router; 