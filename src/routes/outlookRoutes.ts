import express from 'express';
import OutlookIntegration from '../models/OutlookIntegration';
const {
    verifyCredentials,
    sendEmail,
    createDraft,
    getDraft,
    listDrafts,
    createCalendarEvent,
    getCalendarEvent,
    listCalendarEvents
} = require('../services/outlookService');

const router = express.Router();

// Setup Outlook Integration
router.post('/setup', async (req, res) => {
    const { userId, clientId, clientSecret, tenantId, accessToken, refreshToken } = req.body;

    if (!userId || !clientId || !clientSecret || !tenantId || !accessToken || !refreshToken) {
        return res.status(400).json({ success: false, error: 'All fields are required' });
    }

    try {
        // Verify credentials with Outlook
        const verification = await verifyCredentials(tenantId, clientId, clientSecret, accessToken);
        if (!verification.isValid) {
            return res.status(400).json({ 
                success: false, 
                error: 'Invalid Outlook credentials' 
            });
        }

        const integration = await OutlookIntegration.findOneAndUpdate(
            { userId },
            { 
                clientId,
                clientSecret,
                tenantId,
                accessToken,
                refreshToken,
                accountInfo: verification.accountInfo,
                userInfo: verification.userInfo,
                status: 'connected',
                lastConnectionAt: new Date()
            },
            { new: true, upsert: true }
        );

        res.json({ 
            success: true, 
            message: 'Outlook connected successfully!', 
            data: integration 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: 'Failed to setup Outlook integration' 
        });
    }
});

// Disconnect Outlook Integration
router.post('/disconnect', async (req, res) => {
    const { userId } = req.body;

    if (!userId) {
        return res.status(400).json({ success: false, error: 'User ID is required' });
    }

    try {
        const integration = await OutlookIntegration.findOneAndUpdate(
            { userId },
            { status: 'disconnected' },
            { new: true }
        );

        if (!integration) {
            return res.json({ success: true, status: 'pending' });
        }

        res.json({ 
            success: true, 
            message: 'Outlook disconnected successfully!', 
            status: integration.status 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: 'Failed to disconnect Outlook integration' 
        });
    }
});

// Get Outlook Integration Status
router.get('/status', async (req, res) => {
    const { userId } = req.query;

    if (!userId) {
        return res.status(400).json({ success: false, error: 'User ID is required' });
    }

    try {
        const integration = await OutlookIntegration.findOne({ userId });
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
            error: 'Failed to fetch Outlook integration status' 
        });
    }
});

// Send Email
router.post('/emails', async (req, res) => {
    const { userId, emailData } = req.body;
    
    if (!userId || !emailData) {
        return res.status(400).json({ 
            success: false, 
            error: 'User ID and email data are required' 
        });
    }

    try {
        const integration = await OutlookIntegration.findOne({ 
            userId, 
            status: 'connected' 
        });
        
        if (!integration) {
            return res.status(400).json({ 
                success: false, 
                error: 'Outlook is not connected for this user' 
            });
        }

        const result = await sendEmail(integration.accessToken, emailData);
        res.json({ success: true, email: result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Create Draft
router.post('/drafts', async (req, res) => {
    const { userId, draftData } = req.body;
    
    if (!userId || !draftData) {
        return res.status(400).json({ 
            success: false, 
            error: 'User ID and draft data are required' 
        });
    }

    try {
        const integration = await OutlookIntegration.findOne({ 
            userId, 
            status: 'connected' 
        });
        
        if (!integration) {
            return res.status(400).json({ 
                success: false, 
                error: 'Outlook is not connected for this user' 
            });
        }

        const result = await createDraft(integration.accessToken, draftData);
        res.json({ success: true, draft: result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get Draft
router.get('/drafts/:draftId', async (req, res) => {
    const { userId } = req.query;
    const { draftId } = req.params;
    
    if (!userId || !draftId) {
        return res.status(400).json({ 
            success: false, 
            error: 'User ID and draft ID are required' 
        });
    }

    try {
        const integration = await OutlookIntegration.findOne({ 
            userId, 
            status: 'connected' 
        });
        
        if (!integration) {
            return res.status(400).json({ 
                success: false, 
                error: 'Outlook is not connected for this user' 
            });
        }

        const result = await getDraft(integration.accessToken, draftId);
        res.json({ success: true, draft: result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// List Drafts
router.get('/drafts', async (req, res) => {
    const { userId } = req.query;
    const filters = req.query.filters || {};
    
    if (!userId) {
        return res.status(400).json({ 
            success: false, 
            error: 'User ID is required' 
        });
    }

    try {
        const integration = await OutlookIntegration.findOne({ 
            userId, 
            status: 'connected' 
        });
        
        if (!integration) {
            return res.status(400).json({ 
                success: false, 
                error: 'Outlook is not connected for this user' 
            });
        }

        const result = await listDrafts(integration.accessToken, filters);
        res.json({ success: true, drafts: result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Create Calendar Event
router.post('/calendar/events', async (req, res) => {
    const { userId, eventData } = req.body;
    
    if (!userId || !eventData) {
        return res.status(400).json({ 
            success: false, 
            error: 'User ID and event data are required' 
        });
    }

    try {
        const integration = await OutlookIntegration.findOne({ 
            userId, 
            status: 'connected' 
        });
        
        if (!integration) {
            return res.status(400).json({ 
                success: false, 
                error: 'Outlook is not connected for this user' 
            });
        }

        const result = await createCalendarEvent(integration.accessToken, eventData);
        res.json({ success: true, event: result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get Calendar Event
router.get('/calendar/events/:eventId', async (req, res) => {
    const { userId } = req.query;
    const { eventId } = req.params;
    
    if (!userId || !eventId) {
        return res.status(400).json({ 
            success: false, 
            error: 'User ID and event ID are required' 
        });
    }

    try {
        const integration = await OutlookIntegration.findOne({ 
            userId, 
            status: 'connected' 
        });
        
        if (!integration) {
            return res.status(400).json({ 
                success: false, 
                error: 'Outlook is not connected for this user' 
            });
        }

        const result = await getCalendarEvent(integration.accessToken, eventId);
        res.json({ success: true, event: result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// List Calendar Events
router.get('/calendar/events', async (req, res) => {
    const { userId } = req.query;
    const filters = req.query.filters || {};
    
    if (!userId) {
        return res.status(400).json({ 
            success: false, 
            error: 'User ID is required' 
        });
    }

    try {
        const integration = await OutlookIntegration.findOne({ 
            userId, 
            status: 'connected' 
        });
        
        if (!integration) {
            return res.status(400).json({ 
                success: false, 
                error: 'Outlook is not connected for this user' 
            });
        }

        const result = await listCalendarEvents(integration.accessToken, filters);
        res.json({ success: true, events: result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

export default router; 