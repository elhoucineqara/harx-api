import express from 'express';
const router = express.Router();
import OvhIntegration from '../models/OvhIntegration';
import { setupOvh, testConnection, getAccount, getServices, getService, getDomains, getDomain, getDomainRecords, getDomainRecord, createDomainRecord, updateDomainRecord, deleteDomainRecord, refreshDomainZone, getVpsList, getVpsDetails, getVpsStatus, rebootVps, getDedicatedServers, getDedicatedServerDetails, disconnectOvh, getOvhStatus } from '../services/ovhService';

// ✅ Setup OVH Integration
router.post('/setup', async (req, res) => {
    const { userId, applicationKey, applicationSecret, consumerKey, endpoint } = req.body;

    if (!userId || !applicationKey || !applicationSecret || !consumerKey) {
        return res.status(400).json({ 
            success: false, 
            error: 'Missing required fields. Please provide userId, applicationKey, applicationSecret, and consumerKey.' 
        });
    }

    try {
        const integration = await setupOvh(userId, applicationKey, applicationSecret, consumerKey, endpoint);
        res.json({ 
            success: true, 
            message: 'OVH integration setup successfully!', 
            data: {
                status: integration.status,
                endpoint: integration.endpoint
            }
        });
    } catch (error) {
        console.error('❌ Error setting up OVH integration:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to setup OVH integration', 
            message: error.message 
        });
    }
});

// ✅ Test Connection
router.post('/test-connection', async (req, res) => {
    const { userId } = req.body;

    if (!userId) {
        return res.status(400).json({ success: false, error: 'User ID is required' });
    }

    try {
        const result = await testConnection(userId);
        res.json(result);
    } catch (error) {
        console.error('❌ Error testing OVH connection:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to test OVH connection', 
            message: error.message 
        });
    }
});

// ✅ Get Account
router.get('/account', async (req, res) => {
    const { userId } = req.query;

    if (!userId) {
        return res.status(400).json({ success: false, error: 'User ID is required' });
    }

    try {
        const account = await getAccount(userId);
        res.json({ success: true, account });
    } catch (error) {
        console.error('❌ Error getting account:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to get account', 
            message: error.message 
        });
    }
});

// ✅ Get Services
router.get('/services', async (req, res) => {
    const { userId } = req.query;

    if (!userId) {
        return res.status(400).json({ success: false, error: 'User ID is required' });
    }

    try {
        const services = await getServices(userId);
        res.json({ success: true, services });
    } catch (error) {
        console.error('❌ Error getting services:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to get services', 
            message: error.message 
        });
    }
});

// ✅ Get Service
router.get('/services/:serviceId', async (req, res) => {
    const { userId } = req.query;
    const { serviceId } = req.params;

    if (!userId || !serviceId) {
        return res.status(400).json({ 
            success: false, 
            error: 'Missing required fields. Please provide userId and serviceId.' 
        });
    }

    try {
        const service = await getService(userId, serviceId);
        res.json({ success: true, service });
    } catch (error) {
        console.error('❌ Error getting service:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to get service', 
            message: error.message 
        });
    }
});

// ✅ Get Domains
router.get('/domains', async (req, res) => {
    const { userId } = req.query;

    if (!userId) {
        return res.status(400).json({ success: false, error: 'User ID is required' });
    }

    try {
        const domains = await getDomains(userId);
        res.json({ success: true, domains });
    } catch (error) {
        console.error('❌ Error getting domains:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to get domains', 
            message: error.message 
        });
    }
});

// ✅ Get Domain
router.get('/domains/:domainName', async (req, res) => {
    const { userId } = req.query;
    const { domainName } = req.params;

    if (!userId || !domainName) {
        return res.status(400).json({ 
            success: false, 
            error: 'Missing required fields. Please provide userId and domainName.' 
        });
    }

    try {
        const domain = await getDomain(userId, domainName);
        res.json({ success: true, domain });
    } catch (error) {
        console.error('❌ Error getting domain:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to get domain', 
            message: error.message 
        });
    }
});

// ✅ Get Domain Records
router.get('/domains/:domainName/records', async (req, res) => {
    const { userId } = req.query;
    const { domainName } = req.params;

    if (!userId || !domainName) {
        return res.status(400).json({ 
            success: false, 
            error: 'Missing required fields. Please provide userId and domainName.' 
        });
    }

    try {
        const records = await getDomainRecords(userId, domainName);
        res.json({ success: true, records });
    } catch (error) {
        console.error('❌ Error getting domain records:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to get domain records', 
            message: error.message 
        });
    }
});

// ✅ Get Domain Record
router.get('/domains/:domainName/records/:recordId', async (req, res) => {
    const { userId } = req.query;
    const { domainName, recordId } = req.params;

    if (!userId || !domainName || !recordId) {
        return res.status(400).json({ 
            success: false, 
            error: 'Missing required fields. Please provide userId, domainName, and recordId.' 
        });
    }

    try {
        const record = await getDomainRecord(userId, domainName, recordId);
        res.json({ success: true, record });
    } catch (error) {
        console.error('❌ Error getting domain record:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to get domain record', 
            message: error.message 
        });
    }
});

// ✅ Create Domain Record
router.post('/domains/:domainName/records', async (req, res) => {
    const { userId, recordData } = req.body;
    const { domainName } = req.params;

    if (!userId || !domainName || !recordData) {
        return res.status(400).json({ 
            success: false, 
            error: 'Missing required fields. Please provide userId, domainName, and recordData.' 
        });
    }

    try {
        const record = await createDomainRecord(userId, domainName, recordData);
        res.json({ success: true, record });
    } catch (error) {
        console.error('❌ Error creating domain record:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to create domain record', 
            message: error.message 
        });
    }
});

// ✅ Update Domain Record
router.put('/domains/:domainName/records/:recordId', async (req, res) => {
    const { userId, recordData } = req.body;
    const { domainName, recordId } = req.params;

    if (!userId || !domainName || !recordId || !recordData) {
        return res.status(400).json({ 
            success: false, 
            error: 'Missing required fields. Please provide userId, domainName, recordId, and recordData.' 
        });
    }

    try {
        const record = await updateDomainRecord(userId, domainName, recordId, recordData);
        res.json({ success: true, record });
    } catch (error) {
        console.error('❌ Error updating domain record:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to update domain record', 
            message: error.message 
        });
    }
});

// ✅ Delete Domain Record
router.delete('/domains/:domainName/records/:recordId', async (req, res) => {
    const { userId } = req.query;
    const { domainName, recordId } = req.params;

    if (!userId || !domainName || !recordId) {
        return res.status(400).json({ 
            success: false, 
            error: 'Missing required fields. Please provide userId, domainName, and recordId.' 
        });
    }

    try {
        await deleteDomainRecord(userId, domainName, recordId);
        res.json({ success: true, message: 'Domain record deleted successfully' });
    } catch (error) {
        console.error('❌ Error deleting domain record:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to delete domain record', 
            message: error.message 
        });
    }
});

// ✅ Refresh Domain Zone
router.post('/domains/:domainName/refresh', async (req, res) => {
    const { userId } = req.body;
    const { domainName } = req.params;

    if (!userId || !domainName) {
        return res.status(400).json({ 
            success: false, 
            error: 'Missing required fields. Please provide userId and domainName.' 
        });
    }

    try {
        const result = await refreshDomainZone(userId, domainName);
        res.json({ success: true, result });
    } catch (error) {
        console.error('❌ Error refreshing domain zone:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to refresh domain zone', 
            message: error.message 
        });
    }
});

// ✅ Get VPS List
router.get('/vps', async (req, res) => {
    const { userId } = req.query;

    if (!userId) {
        return res.status(400).json({ success: false, error: 'User ID is required' });
    }

    try {
        const vpsList = await getVpsList(userId);
        res.json({ success: true, vpsList });
    } catch (error) {
        console.error('❌ Error getting VPS list:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to get VPS list', 
            message: error.message 
        });
    }
});

// ✅ Get VPS Details
router.get('/vps/:serviceName', async (req, res) => {
    const { userId } = req.query;
    const { serviceName } = req.params;

    if (!userId || !serviceName) {
        return res.status(400).json({ 
            success: false, 
            error: 'Missing required fields. Please provide userId and serviceName.' 
        });
    }

    try {
        const vpsDetails = await getVpsDetails(userId, serviceName);
        res.json({ success: true, vpsDetails });
    } catch (error) {
        console.error('❌ Error getting VPS details:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to get VPS details', 
            message: error.message 
        });
    }
});

// ✅ Get VPS Status
router.get('/vps/:serviceName/status', async (req, res) => {
    const { userId } = req.query;
    const { serviceName } = req.params;

    if (!userId || !serviceName) {
        return res.status(400).json({ 
            success: false, 
            error: 'Missing required fields. Please provide userId and serviceName.' 
        });
    }

    try {
        const vpsStatus = await getVpsStatus(userId, serviceName);
        res.json({ success: true, vpsStatus });
    } catch (error) {
        console.error('❌ Error getting VPS status:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to get VPS status', 
            message: error.message 
        });
    }
});

// ✅ Reboot VPS
router.post('/vps/:serviceName/reboot', async (req, res) => {
    const { userId } = req.body;
    const { serviceName } = req.params;

    if (!userId || !serviceName) {
        return res.status(400).json({ 
            success: false, 
            error: 'Missing required fields. Please provide userId and serviceName.' 
        });
    }

    try {
        const result = await rebootVps(userId, serviceName);
        res.json({ success: true, result });
    } catch (error) {
        console.error('❌ Error rebooting VPS:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to reboot VPS', 
            message: error.message 
        });
    }
});

// ✅ Get Dedicated Servers
router.get('/dedicated-servers', async (req, res) => {
    const { userId } = req.query;

    if (!userId) {
        return res.status(400).json({ success: false, error: 'User ID is required' });
    }

    try {
        const servers = await getDedicatedServers(userId);
        res.json({ success: true, servers });
    } catch (error) {
        console.error('❌ Error getting dedicated servers:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to get dedicated servers', 
            message: error.message 
        });
    }
});

// ✅ Get Dedicated Server Details
router.get('/dedicated-servers/:serviceName', async (req, res) => {
    const { userId } = req.query;
    const { serviceName } = req.params;

    if (!userId || !serviceName) {
        return res.status(400).json({ 
            success: false, 
            error: 'Missing required fields. Please provide userId and serviceName.' 
        });
    }

    try {
        const serverDetails = await getDedicatedServerDetails(userId, serviceName);
        res.json({ success: true, serverDetails });
    } catch (error) {
        console.error('❌ Error getting dedicated server details:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to get dedicated server details', 
            message: error.message 
        });
    }
});

// ✅ Disconnect OVH
router.post('/disconnect', async (req, res) => {
    const { userId } = req.body;

    if (!userId) {
        return res.status(400).json({ success: false, error: 'User ID is required' });
    }

    try {
        const integration = await disconnectOvh(userId);
        res.json({ 
            success: true, 
            message: 'OVH disconnected successfully!', 
            status: integration.status 
        });
    } catch (error) {
        console.error('❌ Error disconnecting OVH:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to disconnect OVH integration', 
            message: error.message 
        });
    }
});

// ✅ Get OVH Status
router.get('/status', async (req, res) => {
    const { userId } = req.query;

    if (!userId) {
        return res.status(400).json({ success: false, error: 'User ID is required' });
    }

    try {
        const integration = await OvhIntegration.findOne({ userId });
        if (!integration) {
            return res.json({ success: true, status: 'pending' });
        }
        
        const status = await getOvhStatus(userId);
        res.json({ success: true, ...status });
    } catch (error) {
        console.error('❌ Error getting OVH status:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to fetch OVH integration status', 
            message: error.message 
        });
    }
});

export default router; 