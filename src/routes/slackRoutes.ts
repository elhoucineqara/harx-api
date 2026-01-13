import express from 'express';
import SlackIntegration from '../models/SlackIntegration';
import slackService from '../services/slackService';
const { sendSlackMessage, verifySlackCredentials, listChannels } = slackService;

const router = express.Router();

// Setup Slack Integration
router.post('/setup', async (req, res) => {
    const { userId, botToken, appId, signingSecret } = req.body;

    if (!userId || !botToken || !appId || !signingSecret) {
        return res.status(400).json({ success: false, error: 'All fields are required' });
    }

    try {
        // Verify credentials with Slack
        const verification = await verifySlackCredentials(botToken);
        if (!verification.isValid) {
            return res.status(400).json({ 
                success: false, 
                error: 'Invalid Slack credentials' 
            });
        }

        const integration = await SlackIntegration.findOneAndUpdate(
            { userId },
            { 
                botToken,
                appId,
                signingSecret,
                workspaceId: verification.workspaceId,
                teamName: verification.teamName,
                botUserId: verification.botUserId,
                status: 'connected',
                lastConnectionAt: new Date()
            },
            { new: true, upsert: true }
        );

        res.json({ 
            success: true, 
            message: 'Slack connected successfully!', 
            data: integration 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: 'Failed to setup Slack integration' 
        });
    }
});

// Disconnect Slack Integration
router.post('/disconnect', async (req, res) => {
    const { userId } = req.body;

    if (!userId) {
        return res.status(400).json({ success: false, error: 'User ID is required' });
    }

    try {
        const integration = await SlackIntegration.findOneAndUpdate(
            { userId },
            { status: 'disconnected' },
            { new: true }
        );

        if (!integration) {
            return res.json({ success: true, status: 'pending' });
        }

        res.json({ 
            success: true, 
            message: 'Slack disconnected successfully!', 
            status: integration.status 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: 'Failed to disconnect Slack integration' 
        });
    }
});

// Reconnect Slack Integration
router.post('/reconnect', async (req, res) => {
    const { userId, botToken, appId, signingSecret } = req.body;

    if (!userId || !botToken || !appId || !signingSecret) {
        return res.status(400).json({ success: false, error: 'All fields are required' });
    }

    try {
        // Verify credentials with Slack
        const verification = await verifySlackCredentials(botToken);
        if (!verification.isValid) {
            return res.status(400).json({ 
                success: false, 
                error: 'Invalid Slack credentials' 
            });
        }

        const integration = await SlackIntegration.findOneAndUpdate(
            { userId },
            { 
                botToken,
                appId,
                signingSecret,
                workspaceId: verification.workspaceId,
                teamName: verification.teamName,
                botUserId: verification.botUserId,
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
            message: 'Slack reconnected successfully!', 
            status: integration.status 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: 'Failed to reconnect Slack integration' 
        });
    }
});

// Get Slack Integration Status
router.get('/status', async (req, res) => {
    const { userId } = req.query;

    if (!userId) {
        return res.status(400).json({ success: false, error: 'User ID is required' });
    }

    try {
        const integration = await SlackIntegration.findOne({ userId });
        if (!integration) {
            return res.json({ success: true, status: 'pending' });
        }
        res.json({ 
            success: true, 
            status: integration.status,
            workspaceInfo: integration.teamName ? {
                teamName: integration.teamName,
                workspaceId: integration.workspaceId
            } : null
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: 'Failed to fetch Slack integration status' 
        });
    }
});

// Send Slack Message
router.post('/send', async (req, res) => {
    const { userId, channelId, text } = req.body;
    
    if (!userId || !channelId || !text) {
        return res.status(400).json({ 
            success: false, 
            error: 'User ID, channel ID, and text are required' 
        });
    }

    try {
        const integration = await SlackIntegration.findOne({ 
            userId, 
            status: 'connected' 
        });
        
        if (!integration) {
            return res.status(400).json({ 
                success: false, 
                error: 'Slack is not connected for this user' 
            });
        }

        const response = await sendSlackMessage(channelId, text, integration.botToken);
        res.json({ success: true, response });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// List Channels
router.get('/channels', async (req, res) => {
    const { userId } = req.query;

    if (!userId) {
        return res.status(400).json({ success: false, error: 'User ID is required' });
    }

    try {
        const integration = await SlackIntegration.findOne({ 
            userId, 
            status: 'connected' 
        });

        if (!integration) {
            return res.status(400).json({ 
                success: false, 
                error: 'Slack is not connected for this user' 
            });
        }

        const channels = await listChannels(integration.botToken);
        res.json({ 
            success: true, 
            channels: channels.map(ch => ({
                id: ch.id,
                name: ch.name,
                isPrivate: ch.is_private
            }))
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: 'Failed to fetch Slack channels' 
        });
    }
});

export default router; 