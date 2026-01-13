import express from 'express';
const HubspotIntegration = require('../../models/hubspotIntegration');
const { 
    verifyCredentials, 
    refreshAccessToken,
    createContact,
    updateContact,
    searchContacts,
    createDeal,
    updateDeal,
    searchDeals,
    getProperties
} = require('../../services/hubspotService');

const router = express.Router();

// Setup HubSpot Integration
router.post('/setup', async (req, res) => {
    const { userId, accessToken, refreshToken, clientId, clientSecret } = req.body;

    if (!userId || !accessToken || !refreshToken || !clientId || !clientSecret) {
        return res.status(400).json({ success: false, error: 'All fields are required' });
    }

    try {
        // Verify credentials with HubSpot
        const verification = await verifyCredentials(accessToken);
        if (!verification.isValid) {
            return res.status(400).json({ 
                success: false, 
                error: 'Invalid HubSpot credentials' 
            });
        }

        const integration = await HubspotIntegration.findOneAndUpdate(
            { userId },
            { 
                accessToken,
                refreshToken,
                clientId,
                clientSecret,
                portalId: verification.accountInfo.portalId,
                accountInfo: verification.accountInfo,
                userInfo: verification.userInfo,
                status: 'connected',
                lastConnectionAt: new Date()
            },
            { new: true, upsert: true }
        );

        res.json({ 
            success: true, 
            message: 'HubSpot connected successfully!', 
            data: integration 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: 'Failed to setup HubSpot integration' 
        });
    }
});

// Disconnect HubSpot Integration
router.post('/disconnect', async (req, res) => {
    const { userId } = req.body;

    if (!userId) {
        return res.status(400).json({ success: false, error: 'User ID is required' });
    }

    try {
        const integration = await HubspotIntegration.findOneAndUpdate(
            { userId },
            { status: 'disconnected' },
            { new: true }
        );

        if (!integration) {
            return res.json({ success: true, status: 'pending' });
        }

        res.json({ 
            success: true, 
            message: 'HubSpot disconnected successfully!', 
            status: integration.status 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: 'Failed to disconnect HubSpot integration' 
        });
    }
});

// Reconnect HubSpot Integration
router.post('/reconnect', async (req, res) => {
    const { userId, accessToken, refreshToken, clientId, clientSecret } = req.body;

    if (!userId || !accessToken || !refreshToken || !clientId || !clientSecret) {
        return res.status(400).json({ success: false, error: 'All fields are required' });
    }

    try {
        // Verify credentials with HubSpot
        const verification = await verifyCredentials(accessToken);
        if (!verification.isValid) {
            return res.status(400).json({ 
                success: false, 
                error: 'Invalid HubSpot credentials' 
            });
        }

        const integration = await HubspotIntegration.findOneAndUpdate(
            { userId },
            { 
                accessToken,
                refreshToken,
                clientId,
                clientSecret,
                portalId: verification.accountInfo.portalId,
                accountInfo: verification.accountInfo,
                userInfo: verification.userInfo,
                status: 'connected',
                lastConnectionAt: new Date()
            },
            { new: true }
        );

        if (!integration) {
            return res.status(404).json({ 
                success: false, 
                error: 'Integration not found. Please setup again.' 
            });
        }

        res.json({ 
            success: true, 
            message: 'HubSpot reconnected successfully!', 
            status: integration.status 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: 'Failed to reconnect HubSpot integration' 
        });
    }
});

// Get HubSpot Integration Status
router.get('/status', async (req, res) => {
    const { userId } = req.query;

    if (!userId) {
        return res.status(400).json({ success: false, error: 'User ID is required' });
    }

    try {
        const integration = await HubspotIntegration.findOne({ userId });
        if (!integration) {
            return res.json({ success: true, status: 'pending' });
        }
        res.json({ 
            success: true, 
            status: integration.status,
            accountInfo: integration.accountInfo,
            userInfo: integration.userInfo
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: 'Failed to fetch HubSpot integration status' 
        });
    }
});

// Create Contact
router.post('/contacts', async (req, res) => {
    const { userId, contactData } = req.body;
    
    if (!userId || !contactData) {
        return res.status(400).json({ 
            success: false, 
            error: 'User ID and contact data are required' 
        });
    }

    try {
        const integration = await HubspotIntegration.findOne({ 
            userId, 
            status: 'connected' 
        });
        
        if (!integration) {
            return res.status(400).json({ 
                success: false, 
                error: 'HubSpot is not connected for this user' 
            });
        }

        const result = await createContact(contactData, integration.accessToken);
        res.json({ success: true, contact: result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Update Contact
router.put('/contacts/:contactId', async (req, res) => {
    const { userId } = req.query;
    const { contactId } = req.params;
    const contactData = req.body;
    
    if (!userId || !contactId || !contactData) {
        return res.status(400).json({ 
            success: false, 
            error: 'User ID, contact ID, and contact data are required' 
        });
    }

    try {
        const integration = await HubspotIntegration.findOne({ 
            userId, 
            status: 'connected' 
        });
        
        if (!integration) {
            return res.status(400).json({ 
                success: false, 
                error: 'HubSpot is not connected for this user' 
            });
        }

        const result = await updateContact(contactId, contactData, integration.accessToken);
        res.json({ success: true, contact: result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Search Contacts
router.post('/contacts/search', async (req, res) => {
    const { userId, query } = req.body;
    
    if (!userId || !query) {
        return res.status(400).json({ 
            success: false, 
            error: 'User ID and search query are required' 
        });
    }

    try {
        const integration = await HubspotIntegration.findOne({ 
            userId, 
            status: 'connected' 
        });
        
        if (!integration) {
            return res.status(400).json({ 
                success: false, 
                error: 'HubSpot is not connected for this user' 
            });
        }

        const results = await searchContacts(query, integration.accessToken);
        res.json({ success: true, contacts: results });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Create Deal
router.post('/deals', async (req, res) => {
    const { userId, dealData } = req.body;
    
    if (!userId || !dealData) {
        return res.status(400).json({ 
            success: false, 
            error: 'User ID and deal data are required' 
        });
    }

    try {
        const integration = await HubspotIntegration.findOne({ 
            userId, 
            status: 'connected' 
        });
        
        if (!integration) {
            return res.status(400).json({ 
                success: false, 
                error: 'HubSpot is not connected for this user' 
            });
        }

        const result = await createDeal(dealData, integration.accessToken);
        res.json({ success: true, deal: result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Update Deal
router.put('/deals/:dealId', async (req, res) => {
    const { userId } = req.query;
    const { dealId } = req.params;
    const dealData = req.body;
    
    if (!userId || !dealId || !dealData) {
        return res.status(400).json({ 
            success: false, 
            error: 'User ID, deal ID, and deal data are required' 
        });
    }

    try {
        const integration = await HubspotIntegration.findOne({ 
            userId, 
            status: 'connected' 
        });
        
        if (!integration) {
            return res.status(400).json({ 
                success: false, 
                error: 'HubSpot is not connected for this user' 
            });
        }

        const result = await updateDeal(dealId, dealData, integration.accessToken);
        res.json({ success: true, deal: result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Search Deals
router.post('/deals/search', async (req, res) => {
    const { userId, query } = req.body;
    
    if (!userId || !query) {
        return res.status(400).json({ 
            success: false, 
            error: 'User ID and search query are required' 
        });
    }

    try {
        const integration = await HubspotIntegration.findOne({ 
            userId, 
            status: 'connected' 
        });
        
        if (!integration) {
            return res.status(400).json({ 
                success: false, 
                error: 'HubSpot is not connected for this user' 
            });
        }

        const results = await searchDeals(query, integration.accessToken);
        res.json({ success: true, deals: results });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get Properties
router.get('/properties/:objectType', async (req, res) => {
    const { userId } = req.query;
    const { objectType } = req.params;
    
    if (!userId || !objectType) {
        return res.status(400).json({ 
            success: false, 
            error: 'User ID and object type are required' 
        });
    }

    try {
        const integration = await HubspotIntegration.findOne({ 
            userId, 
            status: 'connected' 
        });
        
        if (!integration) {
            return res.status(400).json({ 
                success: false, 
                error: 'HubSpot is not connected for this user' 
            });
        }

        const properties = await getProperties(objectType, integration.accessToken);
        res.json({ success: true, properties });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

export default router; 