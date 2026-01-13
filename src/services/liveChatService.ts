const axios = require('axios');
const LiveChatIntegration = require('../../models/liveChatIntegration');

// Create LiveChat API client
const createLiveChatClient = async (userId) => {
    const integration = await LiveChatIntegration.findOne({ userId });
    if (!integration) throw new Error('LiveChat integration not found');

    // Check if token is expired or about to expire (within 5 minutes)
    const isExpired = !integration.tokenExpiresAt || 
                      integration.tokenExpiresAt < new Date(Date.now() + 5 * 60 * 1000);

    if (isExpired && integration.refreshToken) {
        await refreshToken(userId);
        // Get the updated integration
        const updatedIntegration = await LiveChatIntegration.findOne({ userId });
        
        return axios.create({
            baseURL: 'https://api.livechatinc.com/v3.3',
            headers: {
                'Authorization': `Bearer ${updatedIntegration.accessToken}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });
    }

    return axios.create({
        baseURL: 'https://api.livechatinc.com/v3.3',
        headers: {
            'Authorization': `Bearer ${integration.accessToken}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    });
};

// Setup LiveChat Integration
const setupLiveChat = async (userId, clientId, clientSecret, accessToken, refreshToken, accountId = null) => {
    let integration = await LiveChatIntegration.findOne({ userId });

    if (!integration) {
        integration = new LiveChatIntegration({
            userId,
            clientId,
            clientSecret,
            accessToken,
            refreshToken,
            accountId,
            tokenExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // Default to 24 hours
            status: 'connected',
            lastConnectionAt: new Date()
        });
    } else {
        integration.clientId = clientId;
        integration.clientSecret = clientSecret;
        integration.accessToken = accessToken;
        integration.refreshToken = refreshToken;
        if (accountId) integration.accountId = accountId;
        integration.tokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // Default to 24 hours
        integration.status = 'connected';
        integration.lastConnectionAt = new Date();
    }

    await integration.save();
    return integration;
};

// Refresh token
const refreshToken = async (userId) => {
    const integration = await LiveChatIntegration.findOne({ userId });
    if (!integration) throw new Error('LiveChat integration not found');
    if (!integration.refreshToken) throw new Error('No refresh token available');

    try {
        const response = await axios.post('https://accounts.livechatinc.com/token', 
            new URLSearchParams({
                grant_type: 'refresh_token',
                refresh_token: integration.refreshToken,
                client_id: integration.clientId,
                client_secret: integration.clientSecret
            }), 
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
        );

        integration.accessToken = response.data.access_token;
        if (response.data.refresh_token) {
            integration.refreshToken = response.data.refresh_token;
        }
        integration.tokenExpiresAt = new Date(Date.now() + response.data.expires_in * 1000);
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

// Test connection to LiveChat
const testConnection = async (userId) => {
    const integration = await LiveChatIntegration.findOne({ userId });
    if (!integration) throw new Error('LiveChat integration not found');

    try {
        const client = await createLiveChatClient(userId);
        
        // Test the connection by getting the current license
        const response = await client.get('/configuration/agents/me');
        
        integration.status = 'connected';
        integration.lastConnectionAt = new Date();
        await integration.save();
        
        return { 
            success: true, 
            message: 'Successfully connected to LiveChat',
            agent: response.data
        };
    } catch (error) {
        integration.status = 'failed';
        await integration.save();
        throw error;
    }
};

// Get agents
const getAgents = async (userId) => {
    const client = await createLiveChatClient(userId);
    const response = await client.get('/configuration/agents');
    return response.data;
};

// Get a specific agent
const getAgent = async (userId, agentId) => {
    const client = await createLiveChatClient(userId);
    const response = await client.get(`/configuration/agents/${agentId}`);
    return response.data;
};

// Get chats
const getChats = async (userId, filters = {}) => {
    const client = await createLiveChatClient(userId);
    const response = await client.get('/chats', { params: filters });
    return response.data;
};

// Get a specific chat
const getChat = async (userId, chatId) => {
    const client = await createLiveChatClient(userId);
    const response = await client.get(`/chats/${chatId}`);
    return response.data;
};

// Send a chat message
const sendChatMessage = async (userId, chatId, message) => {
    const client = await createLiveChatClient(userId);
    const response = await client.post(`/chats/${chatId}/thread`, {
        text: message
    });
    return response.data;
};

// Get customers
const getCustomers = async (userId, filters = {}) => {
    const client = await createLiveChatClient(userId);
    const response = await client.get('/customers', { params: filters });
    return response.data;
};

// Get a specific customer
const getCustomer = async (userId, customerId) => {
    const client = await createLiveChatClient(userId);
    const response = await client.get(`/customers/${customerId}`);
    return response.data;
};

// Create a customer
const createCustomer = async (userId, customerData) => {
    const client = await createLiveChatClient(userId);
    const response = await client.post('/customers', customerData);
    return response.data;
};

// Update a customer
const updateCustomer = async (userId, customerId, customerData) => {
    const client = await createLiveChatClient(userId);
    const response = await client.put(`/customers/${customerId}`, customerData);
    return response.data;
};

// Get canned responses
const getCannedResponses = async (userId) => {
    const client = await createLiveChatClient(userId);
    const response = await client.get('/configuration/canned_responses');
    return response.data;
};

// Create a canned response
const createCannedResponse = async (userId, responseData) => {
    const client = await createLiveChatClient(userId);
    const response = await client.post('/configuration/canned_responses', responseData);
    return response.data;
};

// Disconnect LiveChat
const disconnectLiveChat = async (userId) => {
    const integration = await LiveChatIntegration.findOne({ userId });
    if (!integration) throw new Error('LiveChat integration not found');

    integration.status = 'disconnected';
    await integration.save();
    return integration;
};

// Get LiveChat Integration Status
const getLiveChatStatus = async (userId) => {
    const integration = await LiveChatIntegration.findOne({ userId });
    if (!integration) throw new Error('LiveChat integration not found');
    
    return {
        status: integration.status,
        lastConnectionAt: integration.lastConnectionAt,
        accountId: integration.accountId,
        tokenExpiresAt: integration.tokenExpiresAt
    };
};

export default { 
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
 }; 