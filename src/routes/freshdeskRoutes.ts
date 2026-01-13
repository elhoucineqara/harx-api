import express from 'express';
const FreshdeskIntegration = require('../../models/freshdeskIntegration');
const {
    verifyCredentials,
    createTicket,
    updateTicket,
    getTicket,
    listTickets,
    createContact,
    updateContact,
    searchContacts
} = require('../../services/freshdeskService');

const router = express.Router();

// Setup Freshdesk Integration
router.post('/setup', async (req, res) => {
    const { userId, domain, apiKey } = req.body;

    if (!userId || !domain || !apiKey) {
        return res.status(400).json({ success: false, error: 'All fields are required' });
    }

    try {
        // Verify credentials with Freshdesk
        const verification = await verifyCredentials(domain, apiKey);
        if (!verification.isValid) {
            return res.status(400).json({ 
                success: false, 
                error: 'Invalid Freshdesk credentials' 
            });
        }

        const integration = await FreshdeskIntegration.findOneAndUpdate(
            { userId },
            { 
                domain,
                apiKey,
                accountInfo: verification.accountInfo,
                userInfo: verification.userInfo,
                status: 'connected',
                lastConnectionAt: new Date()
            },
            { new: true, upsert: true }
        );

        res.json({ 
            success: true, 
            message: 'Freshdesk connected successfully!', 
            data: integration 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: 'Failed to setup Freshdesk integration' 
        });
    }
});

// Disconnect Freshdesk Integration
router.post('/disconnect', async (req, res) => {
    const { userId } = req.body;

    if (!userId) {
        return res.status(400).json({ success: false, error: 'User ID is required' });
    }

    try {
        const integration = await FreshdeskIntegration.findOneAndUpdate(
            { userId },
            { status: 'disconnected' },
            { new: true }
        );

        if (!integration) {
            return res.json({ success: true, status: 'pending' });
        }

        res.json({ 
            success: true, 
            message: 'Freshdesk disconnected successfully!', 
            status: integration.status 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: 'Failed to disconnect Freshdesk integration' 
        });
    }
});

// Reconnect Freshdesk Integration
router.post('/reconnect', async (req, res) => {
    const { userId, domain, apiKey } = req.body;

    if (!userId || !domain || !apiKey) {
        return res.status(400).json({ success: false, error: 'All fields are required' });
    }

    try {
        // Verify credentials with Freshdesk
        const verification = await verifyCredentials(domain, apiKey);
        if (!verification.isValid) {
            return res.status(400).json({ 
                success: false, 
                error: 'Invalid Freshdesk credentials' 
            });
        }

        const integration = await FreshdeskIntegration.findOneAndUpdate(
            { userId },
            { 
                domain,
                apiKey,
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
            message: 'Freshdesk reconnected successfully!', 
            status: integration.status 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: 'Failed to reconnect Freshdesk integration' 
        });
    }
});

// Get Freshdesk Integration Status
router.get('/status', async (req, res) => {
    const { userId } = req.query;

    if (!userId) {
        return res.status(400).json({ success: false, error: 'User ID is required' });
    }

    try {
        const integration = await FreshdeskIntegration.findOne({ userId });
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
            error: 'Failed to fetch Freshdesk integration status' 
        });
    }
});

// Create Ticket
router.post('/tickets', async (req, res) => {
    const { userId, ticketData } = req.body;
    
    if (!userId || !ticketData) {
        return res.status(400).json({ 
            success: false, 
            error: 'User ID and ticket data are required' 
        });
    }

    try {
        const integration = await FreshdeskIntegration.findOne({ 
            userId, 
            status: 'connected' 
        });
        
        if (!integration) {
            return res.status(400).json({ 
                success: false, 
                error: 'Freshdesk is not connected for this user' 
            });
        }

        const result = await createTicket(integration.domain, integration.apiKey, ticketData);
        res.json({ success: true, ticket: result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Update Ticket
router.put('/tickets/:ticketId', async (req, res) => {
    const { userId } = req.query;
    const { ticketId } = req.params;
    const ticketData = req.body;
    
    if (!userId || !ticketId || !ticketData) {
        return res.status(400).json({ 
            success: false, 
            error: 'User ID, ticket ID, and ticket data are required' 
        });
    }

    try {
        const integration = await FreshdeskIntegration.findOne({ 
            userId, 
            status: 'connected' 
        });
        
        if (!integration) {
            return res.status(400).json({ 
                success: false, 
                error: 'Freshdesk is not connected for this user' 
            });
        }

        const result = await updateTicket(integration.domain, integration.apiKey, ticketId, ticketData);
        res.json({ success: true, ticket: result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get Ticket
router.get('/tickets/:ticketId', async (req, res) => {
    const { userId } = req.query;
    const { ticketId } = req.params;
    
    if (!userId || !ticketId) {
        return res.status(400).json({ 
            success: false, 
            error: 'User ID and ticket ID are required' 
        });
    }

    try {
        const integration = await FreshdeskIntegration.findOne({ 
            userId, 
            status: 'connected' 
        });
        
        if (!integration) {
            return res.status(400).json({ 
                success: false, 
                error: 'Freshdesk is not connected for this user' 
            });
        }

        const result = await getTicket(integration.domain, integration.apiKey, ticketId);
        res.json({ success: true, ticket: result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// List Tickets
router.get('/tickets', async (req, res) => {
    const { userId } = req.query;
    const filters = req.query.filters || {};
    
    if (!userId) {
        return res.status(400).json({ 
            success: false, 
            error: 'User ID is required' 
        });
    }

    try {
        const integration = await FreshdeskIntegration.findOne({ 
            userId, 
            status: 'connected' 
        });
        
        if (!integration) {
            return res.status(400).json({ 
                success: false, 
                error: 'Freshdesk is not connected for this user' 
            });
        }

        const result = await listTickets(integration.domain, integration.apiKey, filters);
        res.json({ success: true, tickets: result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
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
        const integration = await FreshdeskIntegration.findOne({ 
            userId, 
            status: 'connected' 
        });
        
        if (!integration) {
            return res.status(400).json({ 
                success: false, 
                error: 'Freshdesk is not connected for this user' 
            });
        }

        const result = await createContact(integration.domain, integration.apiKey, contactData);
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
        const integration = await FreshdeskIntegration.findOne({ 
            userId, 
            status: 'connected' 
        });
        
        if (!integration) {
            return res.status(400).json({ 
                success: false, 
                error: 'Freshdesk is not connected for this user' 
            });
        }

        const result = await updateContact(integration.domain, integration.apiKey, contactId, contactData);
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
        const integration = await FreshdeskIntegration.findOne({ 
            userId, 
            status: 'connected' 
        });
        
        if (!integration) {
            return res.status(400).json({ 
                success: false, 
                error: 'Freshdesk is not connected for this user' 
            });
        }

        const results = await searchContacts(integration.domain, integration.apiKey, query);
        res.json({ success: true, contacts: results });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

export default router; 