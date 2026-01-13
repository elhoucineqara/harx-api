import express from 'express';
import SalesforceIntegration from '../models/SalesforceIntegration';
import { 
    verifyCredentials, 
    refreshAccessToken, 
    createRecord, 
    queryRecords,
    updateRecord,
    describeObject
} from '../services/salesforceService';

const router = express.Router();

// Setup Salesforce Integration
router.post('/setup', async (req, res) => {
    const { userId, instanceUrl, accessToken, refreshToken, clientId, clientSecret } = req.body;

    if (!userId || !instanceUrl || !accessToken || !refreshToken || !clientId || !clientSecret) {
        return res.status(400).json({ success: false, error: 'All fields are required' });
    }

    try {
        // Verify credentials with Salesforce
        const verification = await verifyCredentials(instanceUrl, accessToken);
        if (!verification.isValid) {
            return res.status(400).json({ 
                success: false, 
                error: 'Invalid Salesforce credentials' 
            });
        }

        const integration = await SalesforceIntegration.findOneAndUpdate(
            { userId },
            { 
                instanceUrl,
                accessToken,
                refreshToken,
                clientId,
                clientSecret,
                organizationId: verification.organizationId,
                organizationName: verification.organizationName,
                userInfo: verification.userInfo,
                status: 'connected',
                lastConnectionAt: new Date()
            },
            { new: true, upsert: true }
        );

        res.json({ 
            success: true, 
            message: 'Salesforce connected successfully!', 
            data: integration 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: 'Failed to setup Salesforce integration' 
        });
    }
});

// Disconnect Salesforce Integration
router.post('/disconnect', async (req, res) => {
    const { userId } = req.body;

    if (!userId) {
        return res.status(400).json({ success: false, error: 'User ID is required' });
    }

    try {
        const integration = await SalesforceIntegration.findOneAndUpdate(
            { userId },
            { status: 'disconnected' },
            { new: true }
        );

        if (!integration) {
            return res.json({ success: true, status: 'pending' });
        }

        res.json({ 
            success: true, 
            message: 'Salesforce disconnected successfully!', 
            status: integration.status 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: 'Failed to disconnect Salesforce integration' 
        });
    }
});

// Reconnect Salesforce Integration
router.post('/reconnect', async (req, res) => {
    const { userId, instanceUrl, accessToken, refreshToken, clientId, clientSecret } = req.body;

    if (!userId || !instanceUrl || !accessToken || !refreshToken || !clientId || !clientSecret) {
        return res.status(400).json({ success: false, error: 'All fields are required' });
    }

    try {
        // Verify credentials with Salesforce
        const verification = await verifyCredentials(instanceUrl, accessToken);
        if (!verification.isValid) {
            return res.status(400).json({ 
                success: false, 
                error: 'Invalid Salesforce credentials' 
            });
        }

        const integration = await SalesforceIntegration.findOneAndUpdate(
            { userId },
            { 
                instanceUrl,
                accessToken,
                refreshToken,
                clientId,
                clientSecret,
                organizationId: verification.organizationId,
                organizationName: verification.organizationName,
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
            message: 'Salesforce reconnected successfully!', 
            status: integration.status 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: 'Failed to reconnect Salesforce integration' 
        });
    }
});

// Get Salesforce Integration Status
router.get('/status', async (req, res) => {
    const { userId } = req.query;

    if (!userId) {
        return res.status(400).json({ success: false, error: 'User ID is required' });
    }

    try {
        const integration = await SalesforceIntegration.findOne({ userId });
        if (!integration) {
            return res.json({ success: true, status: 'pending' });
        }
        res.json({ 
            success: true, 
            status: integration.status,
            organizationInfo: integration.organizationName ? {
                organizationName: integration.organizationName,
                organizationId: integration.organizationId
            } : null,
            userInfo: integration.userInfo
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: 'Failed to fetch Salesforce integration status' 
        });
    }
});

// Create Record
router.post('/records', async (req, res) => {
    const { userId, objectName, data } = req.body;
    
    if (!userId || !objectName || !data) {
        return res.status(400).json({ 
            success: false, 
            error: 'User ID, object name, and data are required' 
        });
    }

    try {
        const integration = await SalesforceIntegration.findOne({ 
            userId, 
            status: 'connected' 
        });
        
        if (!integration) {
            return res.status(400).json({ 
                success: false, 
                error: 'Salesforce is not connected for this user' 
            });
        }

        const result = await createRecord(
            objectName, 
            data, 
            integration.instanceUrl, 
            integration.accessToken
        );
        res.json({ success: true, result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Query Records
router.post('/query', async (req, res) => {
    const { userId, soql } = req.body;
    
    if (!userId || !soql) {
        return res.status(400).json({ 
            success: false, 
            error: 'User ID and SOQL query are required' 
        });
    }

    try {
        const integration = await SalesforceIntegration.findOne({ 
            userId, 
            status: 'connected' 
        });
        
        if (!integration) {
            return res.status(400).json({ 
                success: false, 
                error: 'Salesforce is not connected for this user' 
            });
        }

        const records = await queryRecords(
            soql, 
            integration.instanceUrl, 
            integration.accessToken
        );
        res.json({ success: true, records });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Update Record
router.put('/records/:objectName/:id', async (req, res) => {
    const { userId } = req.query;
    const { objectName, id } = req.params;
    const data = req.body;
    
    if (!userId || !objectName || !id || !data) {
        return res.status(400).json({ 
            success: false, 
            error: 'User ID, object name, record ID, and data are required' 
        });
    }

    try {
        const integration = await SalesforceIntegration.findOne({ 
            userId, 
            status: 'connected' 
        });
        
        if (!integration) {
            return res.status(400).json({ 
                success: false, 
                error: 'Salesforce is not connected for this user' 
            });
        }

        const result = await updateRecord(
            objectName,
            id,
            data,
            integration.instanceUrl,
            integration.accessToken
        );
        res.json({ success: true, result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Describe Object
router.get('/describe/:objectName', async (req, res) => {
    const { userId } = req.query;
    const { objectName } = req.params;
    
    if (!userId || !objectName) {
        return res.status(400).json({ 
            success: false, 
            error: 'User ID and object name are required' 
        });
    }

    try {
        const integration = await SalesforceIntegration.findOne({ 
            userId, 
            status: 'connected' 
        });
        
        if (!integration) {
            return res.status(400).json({ 
                success: false, 
                error: 'Salesforce is not connected for this user' 
            });
        }

        const description = await describeObject(
            objectName,
            integration.instanceUrl,
            integration.accessToken
        );
        res.json({ success: true, description });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

export default router; 