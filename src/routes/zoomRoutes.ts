import express from 'express';
import ZoomIntegration from '../models/ZoomIntegration';
import { verifyCredentials, createMeeting, getMeeting, listMeetings, createWebinar, getWebinar, listWebinars } from '../services/zoomService';

const router = express.Router();

// Setup Zoom Integration
router.post('/setup', async (req, res) => {
    const { userId, clientId, clientSecret, accountId, accessToken, refreshToken } = req.body;

    if (!userId || !clientId || !clientSecret || !accountId || !accessToken || !refreshToken) {
        return res.status(400).json({ success: false, error: 'All fields are required' });
    }

    try {
        // Verify credentials with Zoom
        const verification = await verifyCredentials(accountId, clientId, clientSecret, accessToken);
        if (!verification.isValid) {
            return res.status(400).json({ 
                success: false, 
                error: 'Invalid Zoom credentials' 
            });
        }

        const integration = await ZoomIntegration.findOneAndUpdate(
            { userId },
            { 
                clientId,
                clientSecret,
                accountId,
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
            message: 'Zoom connected successfully!', 
            data: integration 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: 'Failed to setup Zoom integration' 
        });
    }
});

// Disconnect Zoom Integration
router.post('/disconnect', async (req, res) => {
    const { userId } = req.body;

    if (!userId) {
        return res.status(400).json({ success: false, error: 'User ID is required' });
    }

    try {
        const integration = await ZoomIntegration.findOneAndUpdate(
            { userId },
            { status: 'disconnected' },
            { new: true }
        );

        if (!integration) {
            return res.json({ success: true, status: 'pending' });
        }

        res.json({ 
            success: true, 
            message: 'Zoom disconnected successfully!', 
            status: integration.status 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: 'Failed to disconnect Zoom integration' 
        });
    }
});

// Get Zoom Integration Status
router.get('/status', async (req, res) => {
    const { userId } = req.query;

    if (!userId) {
        return res.status(400).json({ success: false, error: 'User ID is required' });
    }

    try {
        const integration = await ZoomIntegration.findOne({ userId });
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
            error: 'Failed to fetch Zoom integration status' 
        });
    }
});

// Create Meeting
router.post('/meetings', async (req, res) => {
    const { userId, meetingData } = req.body;
    
    if (!userId || !meetingData) {
        return res.status(400).json({ 
            success: false, 
            error: 'User ID and meeting data are required' 
        });
    }

    try {
        const integration = await ZoomIntegration.findOne({ 
            userId, 
            status: 'connected' 
        });
        
        if (!integration) {
            return res.status(400).json({ 
                success: false, 
                error: 'Zoom is not connected for this user' 
            });
        }

        const result = await createMeeting(integration.accessToken, meetingData);
        res.json({ success: true, meeting: result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get Meeting
router.get('/meetings/:meetingId', async (req, res) => {
    const { userId } = req.query;
    const { meetingId } = req.params;
    
    if (!userId || !meetingId) {
        return res.status(400).json({ 
            success: false, 
            error: 'User ID and meeting ID are required' 
        });
    }

    try {
        const integration = await ZoomIntegration.findOne({ 
            userId, 
            status: 'connected' 
        });
        
        if (!integration) {
            return res.status(400).json({ 
                success: false, 
                error: 'Zoom is not connected for this user' 
            });
        }

        const result = await getMeeting(integration.accessToken, meetingId);
        res.json({ success: true, meeting: result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// List Meetings
router.get('/meetings', async (req, res) => {
    const { userId } = req.query;
    const filters = req.query.filters || {};
    
    if (!userId) {
        return res.status(400).json({ 
            success: false, 
            error: 'User ID is required' 
        });
    }

    try {
        const integration = await ZoomIntegration.findOne({ 
            userId, 
            status: 'connected' 
        });
        
        if (!integration) {
            return res.status(400).json({ 
                success: false, 
                error: 'Zoom is not connected for this user' 
            });
        }

        const result = await listMeetings(integration.accessToken, filters);
        res.json({ success: true, meetings: result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Create Webinar
router.post('/webinars', async (req, res) => {
    const { userId, webinarData } = req.body;
    
    if (!userId || !webinarData) {
        return res.status(400).json({ 
            success: false, 
            error: 'User ID and webinar data are required' 
        });
    }

    try {
        const integration = await ZoomIntegration.findOne({ 
            userId, 
            status: 'connected' 
        });
        
        if (!integration) {
            return res.status(400).json({ 
                success: false, 
                error: 'Zoom is not connected for this user' 
            });
        }

        const result = await createWebinar(integration.accessToken, webinarData);
        res.json({ success: true, webinar: result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get Webinar
router.get('/webinars/:webinarId', async (req, res) => {
    const { userId } = req.query;
    const { webinarId } = req.params;
    
    if (!userId || !webinarId) {
        return res.status(400).json({ 
            success: false, 
            error: 'User ID and webinar ID are required' 
        });
    }

    try {
        const integration = await ZoomIntegration.findOne({ 
            userId, 
            status: 'connected' 
        });
        
        if (!integration) {
            return res.status(400).json({ 
                success: false, 
                error: 'Zoom is not connected for this user' 
            });
        }

        const result = await getWebinar(integration.accessToken, webinarId);
        res.json({ success: true, webinar: result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// List Webinars
router.get('/webinars', async (req, res) => {
    const { userId } = req.query;
    const filters = req.query.filters || {};
    
    if (!userId) {
        return res.status(400).json({ 
            success: false, 
            error: 'User ID is required' 
        });
    }

    try {
        const integration = await ZoomIntegration.findOne({ 
            userId, 
            status: 'connected' 
        });
        
        if (!integration) {
            return res.status(400).json({ 
                success: false, 
                error: 'Zoom is not connected for this user' 
            });
        }

        const result = await listWebinars(integration.accessToken, filters);
        res.json({ success: true, webinars: result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

export default router; 