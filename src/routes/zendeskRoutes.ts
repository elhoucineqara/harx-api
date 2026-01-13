import express from 'express';
import ZendeskIntegration from '../models/ZendeskIntegration';
import { verifyCredentials, createTicket, updateTicket, getTicket, searchTickets, createUser, updateUser, searchUsers } from '../services/zendeskService';

const router = express.Router();

// Setup Zendesk Integration
router.post('/setup', async (req, res) => {
    const { userId, subdomain, email, apiToken } = req.body;

    if (!userId || !subdomain || !email || !apiToken) {
        return res.status(400).json({ success: false, error: 'All fields are required' });
    }

    try {
        // Verify credentials with Zendesk
        const verification = await verifyCredentials(subdomain, email, apiToken);
        if (!verification.isValid) {
            return res.status(400).json({ 
                success: false, 
                error: 'Invalid Zendesk credentials' 
            });
        }

        const integration = await ZendeskIntegration.findOneAndUpdate(
            { userId },
            { 
                subdomain,
                email,
                apiToken,
                accountInfo: verification.accountInfo,
                userInfo: verification.userInfo,
                status: 'connected',
                lastConnectionAt: new Date()
            },
            { new: true, upsert: true }
        );

        res.json({ 
            success: true, 
            message: 'Zendesk connected successfully!', 
            data: integration 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: 'Failed to setup Zendesk integration' 
        });
    }
});

// Disconnect Zendesk Integration
router.post('/disconnect', async (req, res) => {
    const { userId } = req.body;

    if (!userId) {
        return res.status(400).json({ success: false, error: 'User ID is required' });
    }

    try {
        const integration = await ZendeskIntegration.findOneAndUpdate(
            { userId },
            { status: 'disconnected' },
            { new: true }
        );

        if (!integration) {
            return res.json({ success: true, status: 'pending' });
        }

        res.json({ 
            success: true, 
            message: 'Zendesk disconnected successfully!', 
            status: integration.status 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: 'Failed to disconnect Zendesk integration' 
        });
    }
});

// Reconnect Zendesk Integration
router.post('/reconnect', async (req, res) => {
    const { userId, subdomain, email, apiToken } = req.body;

    if (!userId || !subdomain || !email || !apiToken) {
        return res.status(400).json({ success: false, error: 'All fields are required' });
    }

    try {
        // Verify credentials with Zendesk
        const verification = await verifyCredentials(subdomain, email, apiToken);
        if (!verification.isValid) {
            return res.status(400).json({ 
                success: false, 
                error: 'Invalid Zendesk credentials' 
            });
        }

        const integration = await ZendeskIntegration.findOneAndUpdate(
            { userId },
            { 
                subdomain,
                email,
                apiToken,
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
            message: 'Zendesk reconnected successfully!', 
            status: integration.status 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: 'Failed to reconnect Zendesk integration' 
        });
    }
});

// Get Zendesk Integration Status
router.get('/status', async (req, res) => {
    const { userId } = req.query;

    if (!userId) {
        return res.status(400).json({ success: false, error: 'User ID is required' });
    }

    try {
        const integration = await ZendeskIntegration.findOne({ userId });
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
            error: 'Failed to fetch Zendesk integration status' 
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
        const integration = await ZendeskIntegration.findOne({ 
            userId, 
            status: 'connected' 
        });
        
        if (!integration) {
            return res.status(400).json({ 
                success: false, 
                error: 'Zendesk is not connected for this user' 
            });
        }

        const result = await createTicket(
            integration.subdomain,
            integration.email,
            integration.apiToken,
            ticketData
        );
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
        const integration = await ZendeskIntegration.findOne({ 
            userId, 
            status: 'connected' 
        });
        
        if (!integration) {
            return res.status(400).json({ 
                success: false, 
                error: 'Zendesk is not connected for this user' 
            });
        }

        const result = await updateTicket(
            integration.subdomain,
            integration.email,
            integration.apiToken,
            ticketId,
            ticketData
        );
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
        const integration = await ZendeskIntegration.findOne({ 
            userId, 
            status: 'connected' 
        });
        
        if (!integration) {
            return res.status(400).json({ 
                success: false, 
                error: 'Zendesk is not connected for this user' 
            });
        }

        const result = await getTicket(
            integration.subdomain,
            integration.email,
            integration.apiToken,
            ticketId
        );
        res.json({ success: true, ticket: result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Search Tickets
router.post('/tickets/search', async (req, res) => {
    const { userId, query } = req.body;
    
    if (!userId || !query) {
        return res.status(400).json({ 
            success: false, 
            error: 'User ID and search query are required' 
        });
    }

    try {
        const integration = await ZendeskIntegration.findOne({ 
            userId, 
            status: 'connected' 
        });
        
        if (!integration) {
            return res.status(400).json({ 
                success: false, 
                error: 'Zendesk is not connected for this user' 
            });
        }

        const results = await searchTickets(
            integration.subdomain,
            integration.email,
            integration.apiToken,
            query
        );
        res.json({ success: true, tickets: results });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Create User
router.post('/users', async (req, res) => {
    const { userId, userData } = req.body;
    
    if (!userId || !userData) {
        return res.status(400).json({ 
            success: false, 
            error: 'User ID and user data are required' 
        });
    }

    try {
        const integration = await ZendeskIntegration.findOne({ 
            userId, 
            status: 'connected' 
        });
        
        if (!integration) {
            return res.status(400).json({ 
                success: false, 
                error: 'Zendesk is not connected for this user' 
            });
        }

        const result = await createUser(
            integration.subdomain,
            integration.email,
            integration.apiToken,
            userData
        );
        res.json({ success: true, user: result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Update User
router.put('/users/:userId', async (req, res) => {
    const { userId } = req.query;
    const { userId: targetUserId } = req.params;
    const userData = req.body;
    
    if (!userId || !targetUserId || !userData) {
        return res.status(400).json({ 
            success: false, 
            error: 'User ID, target user ID, and user data are required' 
        });
    }

    try {
        const integration = await ZendeskIntegration.findOne({ 
            userId, 
            status: 'connected' 
        });
        
        if (!integration) {
            return res.status(400).json({ 
                success: false, 
                error: 'Zendesk is not connected for this user' 
            });
        }

        const result = await updateUser(
            integration.subdomain,
            integration.email,
            integration.apiToken,
            targetUserId,
            userData
        );
        res.json({ success: true, user: result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Search Users
router.post('/users/search', async (req, res) => {
    const { userId, query } = req.body;
    
    if (!userId || !query) {
        return res.status(400).json({ 
            success: false, 
            error: 'User ID and search query are required' 
        });
    }

    try {
        const integration = await ZendeskIntegration.findOne({ 
            userId, 
            status: 'connected' 
        });
        
        if (!integration) {
            return res.status(400).json({ 
                success: false, 
                error: 'Zendesk is not connected for this user' 
            });
        }

        const results = await searchUsers(
            integration.subdomain,
            integration.email,
            integration.apiToken,
            query
        );
        res.json({ success: true, users: results });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

export default router; 