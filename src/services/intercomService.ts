const axios = require('axios');
const IntercomIntegration = require('../../models/intercomIntegration');

// Create Intercom API client
const createIntercomClient = async (userId) => {
    const integration = await IntercomIntegration.findOne({ userId });
    if (!integration) throw new Error('Intercom integration not found');

    return axios.create({
        baseURL: 'https://api.intercom.io',
        headers: {
            'Authorization': `Bearer ${integration.accessToken}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    });
};

// Setup Intercom Integration
const setupIntercom = async (userId, accessToken, appId = null, workspaceId = null) => {
    let integration = await IntercomIntegration.findOne({ userId });

    if (!integration) {
        integration = new IntercomIntegration({
            userId,
            accessToken,
            appId,
            workspaceId,
            status: 'connected',
            lastConnectionAt: new Date()
        });
    } else {
        integration.accessToken = accessToken;
        if (appId) integration.appId = appId;
        if (workspaceId) integration.workspaceId = workspaceId;
        integration.status = 'connected';
        integration.lastConnectionAt = new Date();
    }

    await integration.save();
    return integration;
};

// Test connection to Intercom
const testConnection = async (userId) => {
    const integration = await IntercomIntegration.findOne({ userId });
    if (!integration) throw new Error('Intercom integration not found');

    try {
        const client = await createIntercomClient(userId);
        
        // Test the connection by getting the current admin
        const response = await client.get('/me');
        
        integration.status = 'connected';
        integration.lastConnectionAt = new Date();
        await integration.save();
        
        return { 
            success: true, 
            message: 'Successfully connected to Intercom',
            admin: response.data
        };
    } catch (error) {
        integration.status = 'failed';
        await integration.save();
        throw error;
    }
};

// Get admins
const getAdmins = async (userId) => {
    const client = await createIntercomClient(userId);
    const response = await client.get('/admins');
    return response.data;
};

// Get contacts (users and leads)
const getContacts = async (userId, page = 1, perPage = 50) => {
    const client = await createIntercomClient(userId);
    const response = await client.get('/contacts', {
        params: {
            page,
            per_page: perPage
        }
    });
    return response.data;
};

// Get a specific contact
const getContact = async (userId, contactId) => {
    const client = await createIntercomClient(userId);
    const response = await client.get(`/contacts/${contactId}`);
    return response.data;
};

// Create a contact
const createContact = async (userId, contactData) => {
    const client = await createIntercomClient(userId);
    const response = await client.post('/contacts', contactData);
    return response.data;
};

// Update a contact
const updateContact = async (userId, contactId, contactData) => {
    const client = await createIntercomClient(userId);
    const response = await client.put(`/contacts/${contactId}`, contactData);
    return response.data;
};

// Archive a contact
const archiveContact = async (userId, contactId) => {
    const client = await createIntercomClient(userId);
    const response = await client.post(`/contacts/${contactId}/archive`, {});
    return response.data;
};

// Get conversations
const getConversations = async (userId, page = 1, perPage = 50) => {
    const client = await createIntercomClient(userId);
    const response = await client.get('/conversations', {
        params: {
            page,
            per_page: perPage
        }
    });
    return response.data;
};

// Get a specific conversation
const getConversation = async (userId, conversationId) => {
    const client = await createIntercomClient(userId);
    const response = await client.get(`/conversations/${conversationId}`);
    return response.data;
};

// Reply to a conversation
const replyToConversation = async (userId, conversationId, replyData) => {
    const client = await createIntercomClient(userId);
    const response = await client.post(`/conversations/${conversationId}/reply`, replyData);
    return response.data;
};

// Close a conversation
const closeConversation = async (userId, conversationId) => {
    const client = await createIntercomClient(userId);
    const response = await client.post(`/conversations/${conversationId}/close`, {});
    return response.data;
};

// Get tags
const getTags = async (userId) => {
    const client = await createIntercomClient(userId);
    const response = await client.get('/tags');
    return response.data;
};

// Create a tag
const createTag = async (userId, name) => {
    const client = await createIntercomClient(userId);
    const response = await client.post('/tags', { name });
    return response.data;
};

// Tag a contact
const tagContact = async (userId, tagId, contactId) => {
    const client = await createIntercomClient(userId);
    const response = await client.post('/tags', {
        id: tagId,
        users: [{ id: contactId }]
    });
    return response.data;
};

// Disconnect Intercom
const disconnectIntercom = async (userId) => {
    const integration = await IntercomIntegration.findOne({ userId });
    if (!integration) throw new Error('Intercom integration not found');

    integration.status = 'disconnected';
    await integration.save();
    return integration;
};

// Get Intercom Integration Status
const getIntercomStatus = async (userId) => {
    const integration = await IntercomIntegration.findOne({ userId });
    if (!integration) throw new Error('Intercom integration not found');
    
    return {
        status: integration.status,
        lastConnectionAt: integration.lastConnectionAt,
        appId: integration.appId,
        workspaceId: integration.workspaceId
    };
};

export default { 
    setupIntercom,
    testConnection,
    getAdmins,
    getContacts,
    getContact,
    createContact,
    updateContact,
    archiveContact,
    getConversations,
    getConversation,
    replyToConversation,
    closeConversation,
    getTags,
    createTag,
    tagContact,
    disconnectIntercom,
    getIntercomStatus
 }; 