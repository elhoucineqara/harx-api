import express from 'express';
const router = express.Router();
const IntercomIntegration = require('../../models/intercomIntegration');
const {
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
} = require('../../services/intercomService');

// ✅ Setup Intercom Integration
router.post('/setup', async (req, res) => {
    const { userId, accessToken, appId, workspaceId } = req.body;

    if (!userId || !accessToken) {
        return res.status(400).json({ 
            success: false, 
            error: 'Missing required fields. Please provide userId and accessToken.' 
        });
    }

    try {
        const integration = await setupIntercom(userId, accessToken, appId, workspaceId);
        res.json({ 
            success: true, 
            message: 'Intercom integration setup successfully!', 
            data: {
                status: integration.status,
                appId: integration.appId,
                workspaceId: integration.workspaceId
            }
        });
    } catch (error) {
        console.error('❌ Error setting up Intercom integration:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to setup Intercom integration', 
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
        console.error('❌ Error testing Intercom connection:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to test Intercom connection', 
            message: error.message 
        });
    }
});

// ✅ Get Admins
router.get('/admins', async (req, res) => {
    const { userId } = req.query;

    if (!userId) {
        return res.status(400).json({ success: false, error: 'User ID is required' });
    }

    try {
        const admins = await getAdmins(userId);
        res.json({ success: true, admins });
    } catch (error) {
        console.error('❌ Error getting admins:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to get admins', 
            message: error.message 
        });
    }
});

// ✅ Get Contacts
router.get('/contacts', async (req, res) => {
    const { userId, page, perPage } = req.query;

    if (!userId) {
        return res.status(400).json({ success: false, error: 'User ID is required' });
    }

    try {
        const contacts = await getContacts(
            userId as string, 
            page ? parseInt(page as string) : 1, 
            perPage ? parseInt(perPage as string) : 50
        );
        res.json({ success: true, contacts });
    } catch (error) {
        console.error('❌ Error getting contacts:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to get contacts', 
            message: error.message 
        });
    }
});

// ✅ Get Contact
router.get('/contacts/:contactId', async (req, res) => {
    const { userId } = req.query;
    const { contactId } = req.params;

    if (!userId || !contactId) {
        return res.status(400).json({ 
            success: false, 
            error: 'Missing required fields. Please provide userId and contactId.' 
        });
    }

    try {
        const contact = await getContact(userId, contactId);
        res.json({ success: true, contact });
    } catch (error) {
        console.error('❌ Error getting contact:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to get contact', 
            message: error.message 
        });
    }
});

// ✅ Create Contact
router.post('/contacts', async (req, res) => {
    const { userId, contactData } = req.body;

    if (!userId || !contactData) {
        return res.status(400).json({ 
            success: false, 
            error: 'Missing required fields. Please provide userId and contactData.' 
        });
    }

    try {
        const contact = await createContact(userId, contactData);
        res.json({ success: true, contact });
    } catch (error) {
        console.error('❌ Error creating contact:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to create contact', 
            message: error.message 
        });
    }
});

// ✅ Update Contact
router.put('/contacts/:contactId', async (req, res) => {
    const { userId, contactData } = req.body;
    const { contactId } = req.params;

    if (!userId || !contactId || !contactData) {
        return res.status(400).json({ 
            success: false, 
            error: 'Missing required fields. Please provide userId, contactId, and contactData.' 
        });
    }

    try {
        const contact = await updateContact(userId, contactId, contactData);
        res.json({ success: true, contact });
    } catch (error) {
        console.error('❌ Error updating contact:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to update contact', 
            message: error.message 
        });
    }
});

// ✅ Archive Contact
router.post('/contacts/:contactId/archive', async (req, res) => {
    const { userId } = req.body;
    const { contactId } = req.params;

    if (!userId || !contactId) {
        return res.status(400).json({ 
            success: false, 
            error: 'Missing required fields. Please provide userId and contactId.' 
        });
    }

    try {
        const result = await archiveContact(userId, contactId);
        res.json({ success: true, result });
    } catch (error) {
        console.error('❌ Error archiving contact:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to archive contact', 
            message: error.message 
        });
    }
});

// ✅ Get Conversations
router.get('/conversations', async (req, res) => {
    const { userId, page, perPage } = req.query;

    if (!userId) {
        return res.status(400).json({ success: false, error: 'User ID is required' });
    }

    try {
        const conversations = await getConversations(
            userId as string, 
            page ? parseInt(page as string) : 1, 
            perPage ? parseInt(perPage as string) : 50
        );
        res.json({ success: true, conversations });
    } catch (error) {
        console.error('❌ Error getting conversations:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to get conversations', 
            message: error.message 
        });
    }
});

// ✅ Get Conversation
router.get('/conversations/:conversationId', async (req, res) => {
    const { userId } = req.query;
    const { conversationId } = req.params;

    if (!userId || !conversationId) {
        return res.status(400).json({ 
            success: false, 
            error: 'Missing required fields. Please provide userId and conversationId.' 
        });
    }

    try {
        const conversation = await getConversation(userId, conversationId);
        res.json({ success: true, conversation });
    } catch (error) {
        console.error('❌ Error getting conversation:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to get conversation', 
            message: error.message 
        });
    }
});

// ✅ Reply to Conversation
router.post('/conversations/:conversationId/reply', async (req, res) => {
    const { userId, replyData } = req.body;
    const { conversationId } = req.params;

    if (!userId || !conversationId || !replyData) {
        return res.status(400).json({ 
            success: false, 
            error: 'Missing required fields. Please provide userId, conversationId, and replyData.' 
        });
    }

    try {
        const result = await replyToConversation(userId, conversationId, replyData);
        res.json({ success: true, result });
    } catch (error) {
        console.error('❌ Error replying to conversation:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to reply to conversation', 
            message: error.message 
        });
    }
});

// ✅ Close Conversation
router.post('/conversations/:conversationId/close', async (req, res) => {
    const { userId } = req.body;
    const { conversationId } = req.params;

    if (!userId || !conversationId) {
        return res.status(400).json({ 
            success: false, 
            error: 'Missing required fields. Please provide userId and conversationId.' 
        });
    }

    try {
        const result = await closeConversation(userId, conversationId);
        res.json({ success: true, result });
    } catch (error) {
        console.error('❌ Error closing conversation:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to close conversation', 
            message: error.message 
        });
    }
});

// ✅ Get Tags
router.get('/tags', async (req, res) => {
    const { userId } = req.query;

    if (!userId) {
        return res.status(400).json({ success: false, error: 'User ID is required' });
    }

    try {
        const tags = await getTags(userId);
        res.json({ success: true, tags });
    } catch (error) {
        console.error('❌ Error getting tags:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to get tags', 
            message: error.message 
        });
    }
});

// ✅ Create Tag
router.post('/tags', async (req, res) => {
    const { userId, name } = req.body;

    if (!userId || !name) {
        return res.status(400).json({ 
            success: false, 
            error: 'Missing required fields. Please provide userId and name.' 
        });
    }

    try {
        const tag = await createTag(userId, name);
        res.json({ success: true, tag });
    } catch (error) {
        console.error('❌ Error creating tag:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to create tag', 
            message: error.message 
        });
    }
});

// ✅ Tag Contact
router.post('/tag-contact', async (req, res) => {
    const { userId, tagId, contactId } = req.body;

    if (!userId || !tagId || !contactId) {
        return res.status(400).json({ 
            success: false, 
            error: 'Missing required fields. Please provide userId, tagId, and contactId.' 
        });
    }

    try {
        const result = await tagContact(userId, tagId, contactId);
        res.json({ success: true, result });
    } catch (error) {
        console.error('❌ Error tagging contact:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to tag contact', 
            message: error.message 
        });
    }
});

// ✅ Disconnect Intercom
router.post('/disconnect', async (req, res) => {
    const { userId } = req.body;

    if (!userId) {
        return res.status(400).json({ success: false, error: 'User ID is required' });
    }

    try {
        const integration = await disconnectIntercom(userId);
        res.json({ 
            success: true, 
            message: 'Intercom disconnected successfully!', 
            status: integration.status 
        });
    } catch (error) {
        console.error('❌ Error disconnecting Intercom:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to disconnect Intercom integration', 
            message: error.message 
        });
    }
});

// ✅ Get Intercom Status
router.get('/status', async (req, res) => {
    const { userId } = req.query;

    if (!userId) {
        return res.status(400).json({ success: false, error: 'User ID is required' });
    }

    try {
        const integration = await IntercomIntegration.findOne({ userId });
        if (!integration) {
            return res.json({ success: true, status: 'pending' });
        }
        
        const status = await getIntercomStatus(userId);
        res.json({ success: true, ...status });
    } catch (error) {
        console.error('❌ Error getting Intercom status:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to fetch Intercom integration status', 
            message: error.message 
        });
    }
});

export default router; 