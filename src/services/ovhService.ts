import ovh from 'ovh';
import OvhIntegration from '../models/OvhIntegration';
import { ParsedQs } from 'qs';

// Create OVH API client
const createOvhClient = async (userId: any) => {
    const integration = await OvhIntegration.findOne({ userId });
    if (!integration) throw new Error('OVH integration not found');

    return ovh({
        endpoint: integration.endpoint,
        appKey: integration.applicationKey,
        appSecret: integration.applicationSecret,
        consumerKey: integration.consumerKey
    });
};

// Setup OVH Integration
const setupOvh = async (userId: any, applicationKey: string, applicationSecret: string, consumerKey: string, endpoint = 'ovh-eu') => {
    let integration = await OvhIntegration.findOne({ userId });

    if (!integration) {
        integration = new OvhIntegration({
            userId,
            applicationKey,
            applicationSecret,
            consumerKey,
            endpoint,
            status: 'connected',
            lastConnectionAt: new Date()
        });
    } else {
        integration.applicationKey = applicationKey;
        integration.applicationSecret = applicationSecret;
        integration.consumerKey = consumerKey;
        integration.endpoint = endpoint;
        integration.status = 'connected';
        integration.lastConnectionAt = new Date();
    }

    await integration.save();
    return integration;
};

// Test connection to OVH
const testConnection = async (userId: any) => {
    const integration = await OvhIntegration.findOne({ userId });
    if (!integration) throw new Error('OVH integration not found');

    try {
        const client = await createOvhClient(userId);
        
        // Test the connection by getting the current user
        const me = await client.requestPromised('GET', '/me');
        
        integration.status = 'connected';
        integration.lastConnectionAt = new Date();
        await integration.save();
        
        return { 
            success: true, 
            message: 'Successfully connected to OVH',
            me
        };
    } catch (error) {
        integration.status = 'failed';
        await integration.save();
        throw error;
    }
};

// Get account details
const getAccount = async (userId: string | ParsedQs | (string | ParsedQs)[]) => {
    const client = await createOvhClient(userId);
    return client.requestPromised('GET', '/me');
};

// Get services
const getServices = async (userId: string | ParsedQs | (string | ParsedQs)[]) => {
    const client = await createOvhClient(userId);
    return client.requestPromised('GET', '/me/service');
};

// Get a specific service
const getService = async (userId: string | ParsedQs | (string | ParsedQs)[], serviceId: string) => {
    const client = await createOvhClient(userId);
    return client.requestPromised('GET', `/me/service/${serviceId}`);
};

// Get domains
const getDomains = async (userId: string | ParsedQs | (string | ParsedQs)[]) => {
    const client = await createOvhClient(userId);
    return client.requestPromised('GET', '/domain');
};

// Get a specific domain
const getDomain = async (userId: string | ParsedQs | (string | ParsedQs)[], domainName: string) => {
    const client = await createOvhClient(userId);
    return client.requestPromised('GET', `/domain/${domainName}`);
};

// Get domain records
const getDomainRecords = async (userId: string | ParsedQs | (string | ParsedQs)[], domainName: string) => {
    const client = await createOvhClient(userId);
    return client.requestPromised('GET', `/domain/zone/${domainName}/record`);
};

// Get a specific domain record
const getDomainRecord = async (userId: string | ParsedQs | (string | ParsedQs)[], domainName: string, recordId: string) => {
    const client = await createOvhClient(userId);
    return client.requestPromised('GET', `/domain/zone/${domainName}/record/${recordId}`);
};

// Create a domain record
const createDomainRecord = async (userId: string | ParsedQs | (string | ParsedQs)[], domainName: string, recordData: any) => {
    const client = await createOvhClient(userId);
    return client.requestPromised('POST', `/domain/zone/${domainName}/record`, recordData);
};

// Update a domain record
const updateDomainRecord = async (userId: string | ParsedQs | (string | ParsedQs)[], domainName: string, recordId: string, recordData: any) => {
    const client = await createOvhClient(userId);
    return client.requestPromised('PUT', `/domain/zone/${domainName}/record/${recordId}`, recordData);
};

// Delete a domain record
const deleteDomainRecord = async (userId: string | ParsedQs | (string | ParsedQs)[], domainName: string, recordId: string) => {
    const client = await createOvhClient(userId);
    return client.requestPromised('DELETE', `/domain/zone/${domainName}/record/${recordId}`);
};

// Refresh domain zone
const refreshDomainZone = async (userId: string | ParsedQs | (string | ParsedQs)[], domainName: string) => {
    const client = await createOvhClient(userId);
    return client.requestPromised('POST', `/domain/zone/${domainName}/refresh`);
};

// Get VPS list
const getVpsList = async (userId: string | ParsedQs | (string | ParsedQs)[]) => {
    const client = await createOvhClient(userId);
    return client.requestPromised('GET', '/vps');
};

// Get VPS details
const getVpsDetails = async (userId: string | ParsedQs | (string | ParsedQs)[], serviceName: string) => {
    const client = await createOvhClient(userId);
    return client.requestPromised('GET', `/vps/${serviceName}`);
};

// Get VPS status
const getVpsStatus = async (userId: string | ParsedQs | (string | ParsedQs)[], serviceName: string) => {
    const client = await createOvhClient(userId);
    return client.requestPromised('GET', `/vps/${serviceName}/status`);
};

// Reboot VPS
const rebootVps = async (userId: string | ParsedQs | (string | ParsedQs)[], serviceName: string) => {
    const client = await createOvhClient(userId);
    return client.requestPromised('POST', `/vps/${serviceName}/reboot`);
};

// Get dedicated servers
const getDedicatedServers = async (userId: string | ParsedQs | (string | ParsedQs)[]) => {
    const client = await createOvhClient(userId);
    return client.requestPromised('GET', '/dedicated/server');
};

// Get dedicated server details
const getDedicatedServerDetails = async (userId: string | ParsedQs | (string | ParsedQs)[], serviceName: string) => {
    const client = await createOvhClient(userId);
    return client.requestPromised('GET', `/dedicated/server/${serviceName}`);
};

// Disconnect OVH
const disconnectOvh = async (userId: string | ParsedQs | (string | ParsedQs)[]) => {
    const integration = await OvhIntegration.findOne({ userId });
    if (!integration) throw new Error('OVH integration not found');

    integration.status = 'disconnected';
    await integration.save();
    return integration;
};

// Get OVH Integration Status
const getOvhStatus = async (userId: string | ParsedQs | (string | ParsedQs)[]) => {
    const integration = await OvhIntegration.findOne({ userId });
    if (!integration) throw new Error('OVH integration not found');
    
    return {
        status: integration.status,
        lastConnectionAt: integration.lastConnectionAt,
        endpoint: integration.endpoint
    };
};

export { 
    setupOvh,
    testConnection,
    getAccount,
    getServices,
    getService,
    getDomains,
    getDomain,
    getDomainRecords,
    getDomainRecord,
    createDomainRecord,
    updateDomainRecord,
    deleteDomainRecord,
    refreshDomainZone,
    getVpsList,
    getVpsDetails,
    getVpsStatus,
    rebootVps,
    getDedicatedServers,
    getDedicatedServerDetails,
    disconnectOvh,
    getOvhStatus
 }; 