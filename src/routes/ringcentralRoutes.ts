import express from 'express';
import RingCentralIntegration from '../models/RingCentralIntegration';
import {
    verifyCredentials,
    createMeeting,
    getMeeting,
    listMeetings,
    createCall,
    getCall,
    listCalls
} from '../services/ringcentralService';

const router = express.Router();

// Setup RingCentral Integration
router.post('/setup', async (req, res) => {
    const { userId, clientId, clientSecret, serverUrl, accessToken, refreshToken } = req.body;

    if (!userId || !clientId || !clientSecret || !serverUrl || !accessToken || !refreshToken) {
        return res.status(400).json({ success: false, error: 'All fields are required' });
    }

    try {
        // Verify credentials with RingCentral
        const verification = await verifyCredentials(serverUrl, clientId, clientSecret, accessToken);
        if (!verification.isValid) {
            return res.status(400).json({ 
                success: false, 
                error: 'Invalid RingCentral credentials' 
            });
        }

        const integration = await RingCentralIntegration.findOneAndUpdate(
            { userId },
            { 
                clientId,
                clientSecret,
                serverUrl,
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
            message: 'RingCentral connected successfully!', 
            data: integration 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: 'Failed to setup RingCentral integration' 
        });
    }
});

// Disconnect RingCentral Integration
router.post('/disconnect', async (req, res) => {
    const { userId } = req.body;

    if (!userId) {
        return res.status(400).json({ success: false, error: 'User ID is required' });
    }

    try {
        const integration = await RingCentralIntegration.findOneAndUpdate(
            { userId },
            { status: 'disconnected' },
            { new: true }
        );

        if (!integration) {
            return res.json({ success: true, status: 'pending' });
        }

        res.json({ 
            success: true, 
            message: 'RingCentral disconnected successfully!', 
            status: integration.status 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: 'Failed to disconnect RingCentral integration' 
        });
    }
});

// Get RingCentral Integration Status
router.get('/status', async (req, res) => {
    const { userId } = req.query;

    if (!userId) {
        return res.status(400).json({ success: false, error: 'User ID is required' });
    }

    try {
        const integration = await RingCentralIntegration.findOne({ userId });
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
            error: 'Failed to fetch RingCentral integration status' 
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
        const integration = await RingCentralIntegration.findOne({ 
            userId, 
            status: 'connected' 
        });
        
        if (!integration) {
            return res.status(400).json({ 
                success: false, 
                error: 'RingCentral is not connected for this user' 
            });
        }

        const result = await createMeeting(integration.serverUrl, integration.accessToken, meetingData);
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
        const integration = await RingCentralIntegration.findOne({ 
            userId, 
            status: 'connected' 
        });
        
        if (!integration) {
            return res.status(400).json({ 
                success: false, 
                error: 'RingCentral is not connected for this user' 
            });
        }

        const result = await getMeeting(integration.serverUrl, integration.accessToken, meetingId);
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
        const integration = await RingCentralIntegration.findOne({ 
            userId, 
            status: 'connected' 
        });
        
        if (!integration) {
            return res.status(400).json({ 
                success: false, 
                error: 'RingCentral is not connected for this user' 
            });
        }

        const result = await listMeetings(integration.serverUrl, integration.accessToken, filters);
        res.json({ success: true, meetings: result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Create Call
router.post('/calls', async (req, res) => {
    const { userId, callData } = req.body;
    
    if (!userId || !callData) {
        return res.status(400).json({ 
            success: false, 
            error: 'User ID and call data are required' 
        });
    }

    try {
        const integration = await RingCentralIntegration.findOne({ 
            userId, 
            status: 'connected' 
        });
        
        if (!integration) {
            return res.status(400).json({ 
                success: false, 
                error: 'RingCentral is not connected for this user' 
            });
        }

        const result = await createCall(integration.serverUrl, integration.accessToken, callData);
        res.json({ success: true, call: result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get Call
router.get('/calls/:callId', async (req, res) => {
    const { userId } = req.query;
    const { callId } = req.params;
    
    if (!userId || !callId) {
        return res.status(400).json({ 
            success: false, 
            error: 'User ID and call ID are required' 
        });
    }

    try {
        const integration = await RingCentralIntegration.findOne({ 
            userId, 
            status: 'connected' 
        });
        
        if (!integration) {
            return res.status(400).json({ 
                success: false, 
                error: 'RingCentral is not connected for this user' 
            });
        }

        const result = await getCall(integration.serverUrl, integration.accessToken, callId);
        res.json({ success: true, call: result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// List Calls
router.get('/calls', async (req, res) => {
    const { userId } = req.query;
    const filters = req.query.filters || {};
    
    if (!userId) {
        return res.status(400).json({ 
            success: false, 
            error: 'User ID is required' 
        });
    }

    try {
        const integration = await RingCentralIntegration.findOne({ 
            userId, 
            status: 'connected' 
        });
        
        if (!integration) {
            return res.status(400).json({ 
                success: false, 
                error: 'RingCentral is not connected for this user' 
            });
        }

        const result = await listCalls(integration.serverUrl, integration.accessToken, filters);
        res.json({ success: true, calls: result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

export default router; 