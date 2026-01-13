import express from 'express';
const InstagramIntegration = require('../../models/instagramIntegration');
const instagramService = require('../../services/instagramService');

const router = express.Router();

// Setup Instagram Integration
router.post('/setup', async (req, res) => {
    const { userId, app_id, app_secret, accessToken } = req.body;

    if (!userId || !app_id || !app_secret || !accessToken) {
        return res.status(400).json({ success: false, error: 'User ID, App ID, App Secret, and Access Token are required' });
    }

    try {
        const verification = await instagramService.verifyAccessToken(accessToken, app_id, app_secret);
        if (!verification.isValid) {
            return res.status(400).json({ success: false, error: 'Invalid Instagram credentials' });
        }

        const integration = await InstagramIntegration.findOneAndUpdate(
            { userId },
            {
                app_id,
                app_secret,
                accessToken,
                accountInfo: verification.accountInfo,
                status: 'connected',
                lastConnectionAt: new Date()
            },
            { new: true, upsert: true }
        );

        res.json({ success: true, message: 'Instagram connected successfully!', data: integration });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to setup Instagram integration' });
    }
});

// Reconnect Instagram Integration
router.post('/reconnect', async (req, res) => {
    const { userId, app_id, app_secret, accessToken } = req.body;

    if (!userId || !app_id || !app_secret || !accessToken) {
        return res.status(400).json({ success: false, error: 'User ID, App ID, App Secret, and Access Token are required' });
    }

    try {
        const verification = await instagramService.verifyAccessToken(accessToken, app_id, app_secret);
        if (!verification.isValid) {
            return res.status(400).json({ success: false, error: 'Invalid Instagram credentials' });
        }

        const integration = await InstagramIntegration.findOneAndUpdate(
            { userId },
            {
                app_id,
                app_secret,
                accessToken,
                accountInfo: verification.accountInfo,
                status: 'connected',
                lastConnectionAt: new Date()
            },
            { new: true }
        );

        if (!integration) {
            return res.status(400).json({ success: false, error: 'Instagram is not set up for this user' });
        }

        res.json({ success: true, message: 'Instagram reconnected successfully!', data: integration });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to reconnect Instagram' });
    }
});

// Disconnect Instagram Integration
router.post('/disconnect', async (req, res) => {
    const { userId } = req.body;

    if (!userId) {
        return res.status(400).json({ success: false, error: 'User ID is required' });
    }

    try {
        const integration = await InstagramIntegration.findOneAndUpdate(
            { userId },
            { status: 'disconnected' },
            { new: true }
        );

        if (!integration) {
            return res.json({ success: true, status: 'pending' });
        }

        res.json({ success: true, message: 'Instagram disconnected successfully!', status: integration.status });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to disconnect Instagram integration' });
    }
});

// Get Instagram Integration Status
router.get('/status', async (req, res) => {
    const { userId } = req.query;

    if (!userId) {
        return res.status(400).json({ success: false, error: 'User ID is required' });
    }

    try {
        const integration = await InstagramIntegration.findOne({ userId });
        if (!integration) {
            return res.json({ success: true, status: 'pending' });
        }
        res.json({ success: true, status: integration.status, accountInfo: integration.accountInfo });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to fetch Instagram integration status' });
    }
});

export default router;
