import express from 'express';
import MailchimpIntegration from '../models/MailchimpIntegration';
import mailchimpService from '../services/mailchimpService';

const router = express.Router();

// Setup Mailchimp Integration
router.post('/setup', async (req, res) => {
    const { userId, apiKey } = req.body;

    if (!userId || !apiKey) {
        return res.status(400).json({ success: false, error: 'All fields are required' });
    }

    try {
        // Verify credentials with Mailchimp
        const verification = await mailchimpService.verifyCredentials(apiKey);
        if (!verification.isValid) {
            return res.status(400).json({ 
                success: false, 
                error: 'Invalid Mailchimp API key' 
            });
        }

        const integration = await MailchimpIntegration.findOneAndUpdate(
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
            message: 'Mailchimp connected successfully!', 
            data: integration 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: 'Failed to setup Mailchimp integration' 
        });
    }
});

// Disconnect Mailchimp Integration
router.post('/disconnect', async (req, res) => {
    const { userId } = req.body;

    if (!userId) {
        return res.status(400).json({ success: false, error: 'User ID is required' });
    }

    try {
        const integration = await MailchimpIntegration.findOneAndUpdate(
            { userId },
            { status: 'disconnected' },
            { new: true }
        );

        if (!integration) {
            return res.json({ success: true, status: 'pending' });
        }

        res.json({ 
            success: true, 
            message: 'Mailchimp disconnected successfully!', 
            status: integration.status 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: 'Failed to disconnect Mailchimp integration' 
        });
    }
});

// Get Mailchimp Integration Status
router.get('/status', async (req, res) => {
    const { userId } = req.query;

    if (!userId) {
        return res.status(400).json({ success: false, error: 'User ID is required' });
    }

    try {
        const integration = await MailchimpIntegration.findOne({ userId });
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
            error: 'Failed to fetch Mailchimp integration status' 
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
        const integration = await MailchimpIntegration.findOne({ 
            userId, 
            status: 'connected' 
        });
        
        if (!integration) {
            return res.status(400).json({ 
                success: false, 
                error: 'Mailchimp is not connected for this user' 
            });
        }

        const result = await mailchimpService.sendEmail(
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
        const integration = await MailchimpIntegration.findOne({ 
            userId, 
            status: 'connected' 
        });
        
        if (!integration) {
            return res.status(400).json({ 
                success: false, 
                error: 'Mailchimp is not connected for this user' 
            });
        }

        const result = await mailchimpService.sendTemplatedEmail(
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
        const integration = await MailchimpIntegration.findOne({ 
            userId, 
            status: 'connected' 
        });
        
        if (!integration) {
            return res.status(400).json({ 
                success: false, 
                error: 'Mailchimp is not connected for this user' 
            });
        }

        const result = await mailchimpService.getSendStatistics(integration.apiKey);
        res.json({ success: true, statistics: result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Create List
router.post('/lists', async (req, res) => {
    const { userId, listData } = req.body;
    
    if (!userId || !listData) {
        return res.status(400).json({ 
            success: false, 
            error: 'User ID and list data are required' 
        });
    }

    try {
        const integration = await MailchimpIntegration.findOne({ 
            userId, 
            status: 'connected' 
        });
        
        if (!integration) {
            return res.status(400).json({ 
                success: false, 
                error: 'Mailchimp is not connected for this user' 
            });
        }

        const result = await mailchimpService.createList(
            integration.apiKey,
            listData
        );
        res.json({ success: true, list: result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get Lists
router.get('/lists', async (req, res) => {
    const { userId } = req.query;
    
    if (!userId) {
        return res.status(400).json({ 
            success: false, 
            error: 'User ID is required' 
        });
    }

    try {
        const integration = await MailchimpIntegration.findOne({ 
            userId, 
            status: 'connected' 
        });
        
        if (!integration) {
            return res.status(400).json({ 
                success: false, 
                error: 'Mailchimp is not connected for this user' 
            });
        }

        const result = await mailchimpService.getLists(integration.apiKey);
        res.json({ success: true, lists: result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Add Member to List
router.post('/lists/:listId/members', async (req, res) => {
    const { listId } = req.params;
    const { userId, memberData } = req.body;
    
    if (!userId || !listId || !memberData) {
        return res.status(400).json({ 
            success: false, 
            error: 'User ID, list ID, and member data are required' 
        });
    }

    try {
        const integration = await MailchimpIntegration.findOne({ 
            userId, 
            status: 'connected' 
        });
        
        if (!integration) {
            return res.status(400).json({ 
                success: false, 
                error: 'Mailchimp is not connected for this user' 
            });
        }

        const result = await mailchimpService.addMemberToList(
            integration.apiKey,
            listId,
            memberData
        );
        res.json({ success: true, member: result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get List Members
router.get('/lists/:listId/members', async (req, res) => {
    const { listId } = req.params;
    const { userId } = req.query;
    
    if (!userId || !listId) {
        return res.status(400).json({ 
            success: false, 
            error: 'User ID and list ID are required' 
        });
    }

    try {
        const integration = await MailchimpIntegration.findOne({ 
            userId, 
            status: 'connected' 
        });
        
        if (!integration) {
            return res.status(400).json({ 
                success: false, 
                error: 'Mailchimp is not connected for this user' 
            });
        }

        const result = await mailchimpService.getListMembers(
            integration.apiKey,
            listId
        );
        res.json({ success: true, members: result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

export default router; 