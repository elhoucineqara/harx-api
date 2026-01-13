import express from 'express';
import TeamsIntegration from '../models/TeamsIntegration';
import { verifyCredentials, createMeeting, getMeeting, listMeetings, createTeam, getTeam, listTeams } from '../services/teamsService';

const router = express.Router();

// Setup Teams Integration
router.post('/setup', async (req, res) => {
    const { userId, clientId, clientSecret, tenantId, accessToken, refreshToken } = req.body;

    if (!userId || !clientId || !clientSecret || !tenantId || !accessToken || !refreshToken) {
        return res.status(400).json({ success: false, error: 'All fields are required' });
    }

    try {
        // Verify credentials with Teams
        const verification = await verifyCredentials(tenantId, clientId, clientSecret, accessToken);
        if (!verification.isValid) {
            return res.status(400).json({ 
                success: false, 
                error: 'Invalid Teams credentials' 
            });
        }

        const integration = await TeamsIntegration.findOneAndUpdate(
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
            message: 'Teams connected successfully!', 
            data: integration 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: 'Failed to setup Teams integration' 
        });
    }
});

// Disconnect Teams Integration
router.post('/disconnect', async (req, res) => {
    const { userId } = req.body;

    if (!userId) {
        return res.status(400).json({ success: false, error: 'User ID is required' });
    }

    try {
        const integration = await TeamsIntegration.findOneAndUpdate(
            { userId },
            { status: 'disconnected' },
            { new: true }
        );

        if (!integration) {
            return res.json({ success: true, status: 'pending' });
        }

        res.json({ 
            success: true, 
            message: 'Teams disconnected successfully!', 
            status: integration.status 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: 'Failed to disconnect Teams integration' 
        });
    }
});

// Get Teams Integration Status
router.get('/status', async (req, res) => {
    const { userId } = req.query;

    if (!userId) {
        return res.status(400).json({ success: false, error: 'User ID is required' });
    }

    try {
        const integration = await TeamsIntegration.findOne({ userId });
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
            error: 'Failed to fetch Teams integration status' 
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
        const integration = await TeamsIntegration.findOne({ 
            userId, 
            status: 'connected' 
        });
        
        if (!integration) {
            return res.status(400).json({ 
                success: false, 
                error: 'Teams is not connected for this user' 
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
        const integration = await TeamsIntegration.findOne({ 
            userId, 
            status: 'connected' 
        });
        
        if (!integration) {
            return res.status(400).json({ 
                success: false, 
                error: 'Teams is not connected for this user' 
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
        const integration = await TeamsIntegration.findOne({ 
            userId, 
            status: 'connected' 
        });
        
        if (!integration) {
            return res.status(400).json({ 
                success: false, 
                error: 'Teams is not connected for this user' 
            });
        }

        const result = await listMeetings(integration.accessToken, filters);
        res.json({ success: true, meetings: result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Create Team
router.post('/teams', async (req, res) => {
    const { userId, teamData } = req.body;
    
    if (!userId || !teamData) {
        return res.status(400).json({ 
            success: false, 
            error: 'User ID and team data are required' 
        });
    }

    try {
        const integration = await TeamsIntegration.findOne({ 
            userId, 
            status: 'connected' 
        });
        
        if (!integration) {
            return res.status(400).json({ 
                success: false, 
                error: 'Teams is not connected for this user' 
            });
        }

        const result = await createTeam(integration.accessToken, teamData);
        res.json({ success: true, team: result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get Team
router.get('/teams/:teamId', async (req, res) => {
    const { userId } = req.query;
    const { teamId } = req.params;
    
    if (!userId || !teamId) {
        return res.status(400).json({ 
            success: false, 
            error: 'User ID and team ID are required' 
        });
    }

    try {
        const integration = await TeamsIntegration.findOne({ 
            userId, 
            status: 'connected' 
        });
        
        if (!integration) {
            return res.status(400).json({ 
                success: false, 
                error: 'Teams is not connected for this user' 
            });
        }

        const result = await getTeam(integration.accessToken, teamId);
        res.json({ success: true, team: result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// List Teams
router.get('/teams', async (req, res) => {
    const { userId } = req.query;
    const filters = req.query.filters || {};
    
    if (!userId) {
        return res.status(400).json({ 
            success: false, 
            error: 'User ID is required' 
        });
    }

    try {
        const integration = await TeamsIntegration.findOne({ 
            userId, 
            status: 'connected' 
        });
        
        if (!integration) {
            return res.status(400).json({ 
                success: false, 
                error: 'Teams is not connected for this user' 
            });
        }

        const result = await listTeams(integration.accessToken, filters);
        res.json({ success: true, teams: result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

export default router; 