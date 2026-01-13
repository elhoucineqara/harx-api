import express from 'express';
import SendgridIntegration from '../models/SendgridIntegrationModel';
import {
    verifyCredentials,
    sendEmail,
    getEmailStats,
    verifySender,
    listTemplates
} from '../services/sendgridService';

const router = express.Router();

// Setup SendGrid Integration
router.post('/setup', async (req, res) => {
    const { userId, apiKey } = req.body;

    if (!userId || !apiKey) {
        return res.status(400).json({ success: false, error: 'All fields are required' });
    }

    try {
        // Verify credentials with SendGrid
        const verification = await verifyCredentials(apiKey);
        if (!verification.isValid) {
            return res.status(400).json({ 
                success: false, 
                error: 'Invalid SendGrid API key' 
            });
        }

        const integration = await SendgridIntegration.findOneAndUpdate(
            { userId },
            { 
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
            message: 'SendGrid connected successfully!', 
            data: integration 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: 'Failed to setup SendGrid integration' 
        });
    }
});

// Disconnect SendGrid Integration
router.post('/disconnect', async (req, res) => {
    const { userId } = req.body;

    if (!userId) {
        return res.status(400).json({ success: false, error: 'User ID is required' });
    }

    try {
        const integration = await SendgridIntegration.findOneAndUpdate(
            { userId },
            { status: 'disconnected' },
            { new: true }
        );

        if (!integration) {
            return res.json({ success: true, status: 'pending' });
        }

        res.json({ 
            success: true, 
            message: 'SendGrid disconnected successfully!', 
            status: integration.status 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: 'Failed to disconnect SendGrid integration' 
        });
    }
});

// Get SendGrid Integration Status
router.get('/status', async (req, res) => {
    const { userId } = req.query;

    if (!userId) {
        return res.status(400).json({ success: false, error: 'User ID is required' });
    }

    try {
        const integration = await SendgridIntegration.findOne({ userId });
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
            error: 'Failed to fetch SendGrid integration status' 
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
        const integration = await SendgridIntegration.findOne({ 
            userId, 
            status: 'connected' 
        });
        
        if (!integration) {
            return res.status(400).json({ 
                success: false, 
                error: 'SendGrid is not connected for this user' 
            });
        }

        const result = await sendEmail(
            integration.apiKey,
            emailData
        );
        res.json({ success: true, email: result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Send Templated Email
router.post('/emails/template', async (req, res) => {
    const { userId, templateData } = req.body;
    
    if (!userId || !templateData) {
        return res.status(400).json({ 
            success: false, 
            error: 'User ID and template data are required' 
        });
    }

    try {
        const integration = await SendgridIntegration.findOne({ 
            userId, 
            status: 'connected' 
        });
        
        if (!integration) {
            return res.status(400).json({ 
                success: false, 
                error: 'SendGrid is not connected for this user' 
            });
        }

        const result = await sendEmail(
            integration.apiKey,
            templateData
        );
        res.json({ success: true, email: result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get Send Statistics
router.get('/statistics', async (req, res) => {
    const { userId } = req.query;
    
    if (!userId) {
        return res.status(400).json({ 
            success: false, 
            error: 'User ID is required' 
        });
    }

    try {
        const integration = await SendgridIntegration.findOne({ 
            userId, 
            status: 'connected' 
        });
        
        if (!integration) {
            return res.status(400).json({ 
                success: false, 
                error: 'SendGrid is not connected for this user' 
            });
        }

        const result = await getEmailStats(integration.apiKey);
        res.json({ success: true, statistics: result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Verify Sender
router.post('/senders/verify', async (req, res) => {
    const { userId, senderData } = req.body;
    
    if (!userId || !senderData) {
        return res.status(400).json({ 
            success: false, 
            error: 'User ID and sender data are required' 
        });
    }

    try {
        const integration = await SendgridIntegration.findOne({ 
            userId, 
            status: 'connected' 
        });
        
        if (!integration) {
            return res.status(400).json({ 
                success: false, 
                error: 'SendGrid is not connected for this user' 
            });
        }

        const result = await verifySender(
            integration.apiKey,
            senderData
        );
        res.json({ success: true, verification: result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get Templates
router.get('/templates', async (req, res) => {
    const { userId } = req.query;
    
    if (!userId) {
        return res.status(400).json({ 
            success: false, 
            error: 'User ID is required' 
        });
    }

    try {
        const integration = await SendgridIntegration.findOne({ 
            userId, 
            status: 'connected' 
        });
        
        if (!integration) {
            return res.status(400).json({ 
                success: false, 
                error: 'SendGrid is not connected for this user' 
            });
        }

        const result = await listTemplates(integration.apiKey);
        res.json({ success: true, templates: result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

export default router; 