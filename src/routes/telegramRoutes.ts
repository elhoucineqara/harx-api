import express from 'express';
import { sendTelegramMessage }  from '../services/telegramService';
import TelegramIntegration from '../models/TelegramIntegration';

const router = express.Router();

// Setup Telegram Integration
router.post('/setup', async (req, res) => {
    const { userId, botToken } = req.body;

    if (!userId || !botToken) {
        return res.status(400).json({ success: false, error: 'All fields are required' });
    }

    try {
        const integration = await TelegramIntegration.findOneAndUpdate(
            { userId },
            { botToken, status: 'connected' },
            { new: true, upsert: true }
        );

        res.json({ success: true, message: 'Telegram connected successfully!', data: integration });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to setup Telegram integration' });
    }
});

// Disconnect Telegram Integration
router.post('/disconnect', async (req, res) => {
    const { userId } = req.body;

    if (!userId) {
        return res.status(400).json({ success: false, error: 'User ID is required' });
    }

    try {
        const integration = await TelegramIntegration.findOneAndUpdate(
            { userId },
            { status: 'disconnected' },
            { new: true }
        );

        if (!integration) {
            return res.json({ success: true, status: 'pending' });
        }

        res.json({ success: true, message: 'Telegram disconnected successfully!', status: integration.status });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to disconnect Telegram integration' });
    }
});

// Reconnect Telegram Integration
router.post('/reconnect', async (req, res) => {
    const { userId, botToken } = req.body;

    if (!userId || !botToken) {
        return res.status(400).json({ success: false, error: 'All fields are required' });
    }

    try {
        const integration = await TelegramIntegration.findOne({ userId });

        if (!integration) {
            return res.status(404).json({ success: false, error: 'Integration not found. Please setup again.' });
        }

        integration.botToken = botToken;
        integration.status = 'connected';
        await integration.save();

        res.json({ success: true, message: 'Telegram reconnected successfully!', status: integration.status });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to reconnect Telegram integration' });
    }
});

// Send Telegram Message
router.post('/send', async (req, res) => {
    const { userId, chatId, text } = req.body;
    if (!userId || !chatId || !text) {
        return res.status(400).json({ success: false, error: 'User ID, recipient, and text are required' });
    }
    try {
        const integration = await TelegramIntegration.findOne({ userId, status: 'connected' });
        if (!integration) {
            return res.status(400).json({ success: false, error: 'Telegram is not connected for this user' });
        }
        const response = await sendTelegramMessage(chatId, text, integration.botToken);
        res.json({ success: true, response });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get Telegram Integration Status
router.get('/status', async (req, res) => {
    const { userId } = req.query;

    if (!userId) {
        return res.status(400).json({ success: false, error: 'User ID is required' });
    }

    try {
        const integration = await TelegramIntegration.findOne({ userId });
        if (!integration) {
            return res.json({ success: true, status: 'pending' });
        }
        res.json({ success: true, status: integration.status });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to fetch Telegram integration status' });
    }
});

export default router;
