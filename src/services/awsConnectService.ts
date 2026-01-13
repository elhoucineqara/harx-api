const AWS = require('aws-sdk');
const AwsConnectIntegration = require('../../models/awsConnectIntegration');

// Create AWS Connect client
const createConnectClient = async (userId) => {
    const integration = await AwsConnectIntegration.findOne({ userId });
    if (!integration) throw new Error('AWS Connect integration not found');

    const credentials = {
        accessKeyId: integration.accessKeyId,
        secretAccessKey: integration.secretAccessKey
    };

    AWS.config.update({
        credentials: credentials,
        region: integration.region
    });

    return new AWS.Connect();
};

// Setup AWS Connect Integration
const setupAwsConnect = async (userId, accessKeyId, secretAccessKey, region, instanceId) => {
    let integration = await AwsConnectIntegration.findOne({ userId });

    if (!integration) {
        integration = new AwsConnectIntegration({
            userId,
            accessKeyId,
            secretAccessKey,
            region,
            instanceId,
            status: 'connected',
            lastConnectionAt: new Date()
        });
    } else {
        integration.accessKeyId = accessKeyId;
        integration.secretAccessKey = secretAccessKey;
        integration.region = region;
        integration.instanceId = instanceId;
        integration.status = 'connected';
        integration.lastConnectionAt = new Date();
    }

    await integration.save();
    return integration;
};

// Test connection to AWS Connect
const testConnection = async (userId) => {
    const integration = await AwsConnectIntegration.findOne({ userId });
    if (!integration) throw new Error('AWS Connect integration not found');

    try {
        const connect = await createConnectClient(userId);
        
        // Test the connection by listing phone numbers
        await connect.listPhoneNumbers({
            InstanceId: integration.instanceId,
            MaxResults: 1
        }).promise();
        
        integration.status = 'connected';
        integration.lastConnectionAt = new Date();
        await integration.save();
        
        return { success: true, message: 'Successfully connected to AWS Connect' };
    } catch (error) {
        integration.status = 'failed';
        await integration.save();
        throw error;
    }
};

// List phone numbers
const listPhoneNumbers = async (userId, maxResults = 10) => {
    const connect = await createConnectClient(userId);
    const integration = await AwsConnectIntegration.findOne({ userId });
    
    const params = {
        InstanceId: integration.instanceId,
        MaxResults: maxResults
    };
    
    const response = await connect.listPhoneNumbers(params).promise();
    return response.PhoneNumberSummaryList;
};

// List users
const listUsers = async (userId, maxResults = 10) => {
    const connect = await createConnectClient(userId);
    const integration = await AwsConnectIntegration.findOne({ userId });
    
    const params = {
        InstanceId: integration.instanceId,
        MaxResults: maxResults
    };
    
    const response = await connect.listUsers(params).promise();
    return response.UserSummaryList;
};

// List queues
const listQueues = async (userId, maxResults = 10) => {
    const connect = await createConnectClient(userId);
    const integration = await AwsConnectIntegration.findOne({ userId });
    
    const params = {
        InstanceId: integration.instanceId,
        MaxResults: maxResults
    };
    
    const response = await connect.listQueues(params).promise();
    return response.QueueSummaryList;
};

// Get metrics
const getMetrics = async (userId, queueIds = [], startTime, endTime) => {
    const connect = await createConnectClient(userId);
    const integration = await AwsConnectIntegration.findOne({ userId });
    
    const params = {
        InstanceId: integration.instanceId,
        StartTime: startTime || new Date(Date.now() - 24 * 60 * 60 * 1000), // Default to last 24 hours
        EndTime: endTime || new Date(),
        Filters: {
            Queues: queueIds
        },
        HistoricalMetrics: [
            { Name: 'CONTACTS_HANDLED', Unit: 'COUNT' },
            { Name: 'CONTACTS_ABANDONED', Unit: 'COUNT' },
            { Name: 'AVERAGE_HANDLE_TIME', Unit: 'SECONDS' },
            { Name: 'AVERAGE_QUEUE_ANSWER_TIME', Unit: 'SECONDS' }
        ]
    };
    
    const response = await connect.getMetricData(params).promise();
    return response.MetricResults;
};

// Disconnect AWS Connect
const disconnectAwsConnect = async (userId) => {
    const integration = await AwsConnectIntegration.findOne({ userId });
    if (!integration) throw new Error('AWS Connect integration not found');

    integration.status = 'disconnected';
    await integration.save();
    return integration;
};

// Get AWS Connect Integration Status
const getAwsConnectStatus = async (userId) => {
    const integration = await AwsConnectIntegration.findOne({ userId });
    if (!integration) throw new Error('AWS Connect integration not found');
    
    return {
        status: integration.status,
        lastConnectionAt: integration.lastConnectionAt,
        region: integration.region,
        instanceId: integration.instanceId
    };
};

export default { 
    setupAwsConnect,
    testConnection,
    listPhoneNumbers,
    listUsers,
    listQueues,
    getMetrics,
    disconnectAwsConnect,
    getAwsConnectStatus
 }; 