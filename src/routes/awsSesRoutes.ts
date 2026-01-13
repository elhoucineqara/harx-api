import express from 'express';
const AwsSesIntegration = require('../../models/awsSesIntegration');
const {
    verifyCredentials,
    sendEmail,
    sendTemplatedEmail,
    getSendStatistics,
    verifyEmailIdentity,
    verifyDomainIdentity
} = require('../../services/awsSesService');

const router = express.Router();

// Setup AWS SES Integration
router.post('/setup', async (req, res) => {
    const { userId, accessKeyId, secretAccessKey, region } = req.body;

    if (!userId || !accessKeyId || !secretAccessKey || !region) {
        return res.status(400).json({ success: false, error: 'All fields are required' });
    }

    try {
        // Verify credentials with AWS SES
        const verification = await verifyCredentials(accessKeyId, secretAccessKey, region);
        if (!verification.isValid) {
            return res.status(400).json({ 
                success: false, 
                error: 'Invalid AWS SES credentials' 
            });
        }

        const integration = await AwsSesIntegration.findOneAndUpdate(
            { userId },
            { 
                accessKeyId,
                secretAccessKey,
                region,
                accountInfo: verification.accountInfo,
                userInfo: verification.userInfo,
                status: 'connected',
                lastConnectionAt: new Date()
            },
            { new: true, upsert: true }
        );

        res.json({ 
            success: true, 
            message: 'AWS SES connected successfully!', 
            data: integration 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: 'Failed to setup AWS SES integration' 
        });
    }
});

// Disconnect AWS SES Integration
router.post('/disconnect', async (req, res) => {
    const { userId } = req.body;

    if (!userId) {
        return res.status(400).json({ success: false, error: 'User ID is required' });
    }

    try {
        const integration = await AwsSesIntegration.findOneAndUpdate(
            { userId },
            { status: 'disconnected' },
            { new: true }
        );

        if (!integration) {
            return res.json({ success: true, status: 'pending' });
        }

        res.json({ 
            success: true, 
            message: 'AWS SES disconnected successfully!', 
            status: integration.status 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: 'Failed to disconnect AWS SES integration' 
        });
    }
});

// Get AWS SES Integration Status
router.get('/status', async (req, res) => {
    const { userId } = req.query;

    if (!userId) {
        return res.status(400).json({ success: false, error: 'User ID is required' });
    }

    try {
        const integration = await AwsSesIntegration.findOne({ userId });
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
            error: 'Failed to fetch AWS SES integration status' 
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
        const integration = await AwsSesIntegration.findOne({ 
            userId, 
            status: 'connected' 
        });
        
        if (!integration) {
            return res.status(400).json({ 
                success: false, 
                error: 'AWS SES is not connected for this user' 
            });
        }

        const result = await sendEmail(
            integration.accessKeyId,
            integration.secretAccessKey,
            integration.region,
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
        const integration = await AwsSesIntegration.findOne({ 
            userId, 
            status: 'connected' 
        });
        
        if (!integration) {
            return res.status(400).json({ 
                success: false, 
                error: 'AWS SES is not connected for this user' 
            });
        }

        const result = await sendTemplatedEmail(
            integration.accessKeyId,
            integration.secretAccessKey,
            integration.region,
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
        const integration = await AwsSesIntegration.findOne({ 
            userId, 
            status: 'connected' 
        });
        
        if (!integration) {
            return res.status(400).json({ 
                success: false, 
                error: 'AWS SES is not connected for this user' 
            });
        }

        const result = await getSendStatistics(
            integration.accessKeyId,
            integration.secretAccessKey,
            integration.region
        );
        res.json({ success: true, statistics: result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Verify Email Identity
router.post('/identities/email', async (req, res) => {
    const { userId, email } = req.body;
    
    if (!userId || !email) {
        return res.status(400).json({ 
            success: false, 
            error: 'User ID and email are required' 
        });
    }

    try {
        const integration = await AwsSesIntegration.findOne({ 
            userId, 
            status: 'connected' 
        });
        
        if (!integration) {
            return res.status(400).json({ 
                success: false, 
                error: 'AWS SES is not connected for this user' 
            });
        }

        const result = await verifyEmailIdentity(
            integration.accessKeyId,
            integration.secretAccessKey,
            integration.region,
            email
        );
        res.json({ success: true, verification: result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Verify Domain Identity
router.post('/identities/domain', async (req, res) => {
    const { userId, domain } = req.body;
    
    if (!userId || !domain) {
        return res.status(400).json({ 
            success: false, 
            error: 'User ID and domain are required' 
        });
    }

    try {
        const integration = await AwsSesIntegration.findOne({ 
            userId, 
            status: 'connected' 
        });
        
        if (!integration) {
            return res.status(400).json({ 
                success: false, 
                error: 'AWS SES is not connected for this user' 
            });
        }

        const result = await verifyDomainIdentity(
            integration.accessKeyId,
            integration.secretAccessKey,
            integration.region,
            domain
        );
        res.json({ success: true, verification: result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

export default router; 