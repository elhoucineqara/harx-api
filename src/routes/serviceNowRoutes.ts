import express from 'express';
import ServiceNowIntegration from '../models/ServiceNowIntegration';
import { verifyCredentials, createIncident, updateIncident, getIncident, searchIncidents, createUser, updateUser, searchUsers } from '../services/serviceNowService';

const router = express.Router();

// Setup ServiceNow Integration
router.post('/setup', async (req, res) => {
    const { userId, instanceUrl, username, password, clientId, clientSecret } = req.body;

    if (!userId || !instanceUrl || !username || !password || !clientId || !clientSecret) {
        return res.status(400).json({ success: false, error: 'All fields are required' });
    }

    try {
        // Verify credentials with ServiceNow
        const verification = await verifyCredentials(instanceUrl, username, password);
        if (!verification.isValid) {
            return res.status(400).json({ 
                success: false, 
                error: 'Invalid ServiceNow credentials' 
            });
        }

        const integration = await ServiceNowIntegration.findOneAndUpdate(
            { userId },
            { 
                instanceUrl,
                username,
                password,
                clientId,
                clientSecret,
                accountInfo: verification.accountInfo,
                userInfo: verification.userInfo,
                status: 'connected',
                lastConnectionAt: new Date()
            },
            { new: true, upsert: true }
        );

        res.json({ 
            success: true, 
            message: 'ServiceNow connected successfully!', 
            data: integration 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: 'Failed to setup ServiceNow integration' 
        });
    }
});

// Disconnect ServiceNow Integration
router.post('/disconnect', async (req, res) => {
    const { userId } = req.body;

    if (!userId) {
        return res.status(400).json({ success: false, error: 'User ID is required' });
    }

    try {
        const integration = await ServiceNowIntegration.findOneAndUpdate(
            { userId },
            { status: 'disconnected' },
            { new: true }
        );

        if (!integration) {
            return res.json({ success: true, status: 'pending' });
        }

        res.json({ 
            success: true, 
            message: 'ServiceNow disconnected successfully!', 
            status: integration.status 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: 'Failed to disconnect ServiceNow integration' 
        });
    }
});

// Reconnect ServiceNow Integration
router.post('/reconnect', async (req, res) => {
    const { userId, instanceUrl, username, password, clientId, clientSecret } = req.body;

    if (!userId || !instanceUrl || !username || !password || !clientId || !clientSecret) {
        return res.status(400).json({ success: false, error: 'All fields are required' });
    }

    try {
        // Verify credentials with ServiceNow
        const verification = await verifyCredentials(instanceUrl, username, password);
        if (!verification.isValid) {
            return res.status(400).json({ 
                success: false, 
                error: 'Invalid ServiceNow credentials' 
            });
        }

        const integration = await ServiceNowIntegration.findOneAndUpdate(
            { userId },
            { 
                instanceUrl,
                username,
                password,
                clientId,
                clientSecret,
                accountInfo: verification.accountInfo,
                userInfo: verification.userInfo,
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
            message: 'ServiceNow reconnected successfully!', 
            status: integration.status 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: 'Failed to reconnect ServiceNow integration' 
        });
    }
});

// Get ServiceNow Integration Status
router.get('/status', async (req, res) => {
    const { userId } = req.query;

    if (!userId) {
        return res.status(400).json({ success: false, error: 'User ID is required' });
    }

    try {
        const integration = await ServiceNowIntegration.findOne({ userId });
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
            error: 'Failed to fetch ServiceNow integration status' 
        });
    }
});

// Create Incident
router.post('/incidents', async (req, res) => {
    const { userId, incidentData } = req.body;
    
    if (!userId || !incidentData) {
        return res.status(400).json({ 
            success: false, 
            error: 'User ID and incident data are required' 
        });
    }

    try {
        const integration = await ServiceNowIntegration.findOne({ 
            userId, 
            status: 'connected' 
        });
        
        if (!integration) {
            return res.status(400).json({ 
                success: false, 
                error: 'ServiceNow is not connected for this user' 
            });
        }

        const result = await createIncident(
            integration.instanceUrl,
            integration.username,
            integration.password,
            incidentData
        );
        res.json({ success: true, incident: result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Update Incident
router.put('/incidents/:incidentId', async (req, res) => {
    const { userId } = req.query;
    const { incidentId } = req.params;
    const incidentData = req.body;
    
    if (!userId || !incidentId || !incidentData) {
        return res.status(400).json({ 
            success: false, 
            error: 'User ID, incident ID, and incident data are required' 
        });
    }

    try {
        const integration = await ServiceNowIntegration.findOne({ 
            userId, 
            status: 'connected' 
        });
        
        if (!integration) {
            return res.status(400).json({ 
                success: false, 
                error: 'ServiceNow is not connected for this user' 
            });
        }

        const result = await updateIncident(
            integration.instanceUrl,
            integration.username,
            integration.password,
            incidentId,
            incidentData
        );
        res.json({ success: true, incident: result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get Incident
router.get('/incidents/:incidentId', async (req, res) => {
    const { userId } = req.query;
    const { incidentId } = req.params;
    
    if (!userId || !incidentId) {
        return res.status(400).json({ 
            success: false, 
            error: 'User ID and incident ID are required' 
        });
    }

    try {
        const integration = await ServiceNowIntegration.findOne({ 
            userId, 
            status: 'connected' 
        });
        
        if (!integration) {
            return res.status(400).json({ 
                success: false, 
                error: 'ServiceNow is not connected for this user' 
            });
        }

        const result = await getIncident(
            integration.instanceUrl,
            integration.username,
            integration.password,
            incidentId
        );
        res.json({ success: true, incident: result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Search Incidents
router.post('/incidents/search', async (req, res) => {
    const { userId, query } = req.body;
    
    if (!userId || !query) {
        return res.status(400).json({ 
            success: false, 
            error: 'User ID and search query are required' 
        });
    }

    try {
        const integration = await ServiceNowIntegration.findOne({ 
            userId, 
            status: 'connected' 
        });
        
        if (!integration) {
            return res.status(400).json({ 
                success: false, 
                error: 'ServiceNow is not connected for this user' 
            });
        }

        const results = await searchIncidents(
            integration.instanceUrl,
            integration.username,
            integration.password,
            query
        );
        res.json({ success: true, incidents: results });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Create User
router.post('/users', async (req, res) => {
    const { userId, userData } = req.body;
    
    if (!userId || !userData) {
        return res.status(400).json({ 
            success: false, 
            error: 'User ID and user data are required' 
        });
    }

    try {
        const integration = await ServiceNowIntegration.findOne({ 
            userId, 
            status: 'connected' 
        });
        
        if (!integration) {
            return res.status(400).json({ 
                success: false, 
                error: 'ServiceNow is not connected for this user' 
            });
        }

        const result = await createUser(
            integration.instanceUrl,
            integration.username,
            integration.password,
            userData
        );
        res.json({ success: true, user: result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Update User
router.put('/users/:userId', async (req, res) => {
    const { userId } = req.query;
    const { userId: targetUserId } = req.params;
    const userData = req.body;
    
    if (!userId || !targetUserId || !userData) {
        return res.status(400).json({ 
            success: false, 
            error: 'User ID, target user ID, and user data are required' 
        });
    }

    try {
        const integration = await ServiceNowIntegration.findOne({ 
            userId, 
            status: 'connected' 
        });
        
        if (!integration) {
            return res.status(400).json({ 
                success: false, 
                error: 'ServiceNow is not connected for this user' 
            });
        }

        const result = await updateUser(
            integration.instanceUrl,
            integration.username,
            integration.password,
            targetUserId,
            userData
        );
        res.json({ success: true, user: result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Search Users
router.post('/users/search', async (req, res) => {
    const { userId, query } = req.body;
    
    if (!userId || !query) {
        return res.status(400).json({ 
            success: false, 
            error: 'User ID and search query are required' 
        });
    }

    try {
        const integration = await ServiceNowIntegration.findOne({ 
            userId, 
            status: 'connected' 
        });
        
        if (!integration) {
            return res.status(400).json({ 
                success: false, 
                error: 'ServiceNow is not connected for this user' 
            });
        }

        const results = await searchUsers(
            integration.instanceUrl,
            integration.username,
            integration.password,
            query
        );
        res.json({ success: true, users: results });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

export default router; 