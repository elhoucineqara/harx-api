import AWS from 'aws-sdk';
import AwsSnsIntegration from '../models/AwsSnsIntegration';

// Create AWS SNS client
const createSnsClient = async (userId: any) => {
    const integration = await AwsSnsIntegration.findOne({ userId });
    if (!integration) throw new Error('AWS SNS integration not found');

    const credentials = {
        accessKeyId: integration.accessKeyId,
        secretAccessKey: integration.secretAccessKey
    };

    AWS.config.update({
        credentials: credentials,
        region: integration.region
    });

    return new AWS.SNS();
};

// Setup AWS SNS Integration
const setupAwsSns = async (userId, accessKeyId, secretAccessKey, region = 'us-east-1', defaultTopicArn = null) => {
    let integration = await AwsSnsIntegration.findOne({ userId });

    if (!integration) {
        integration = new AwsSnsIntegration({
            userId,
            accessKeyId,
            secretAccessKey,
            region,
            defaultTopicArn,
            status: 'connected',
            lastConnectionAt: new Date()
        });
    } else {
        integration.accessKeyId = accessKeyId;
        integration.secretAccessKey = secretAccessKey;
        integration.region = region;
        if (defaultTopicArn) integration.defaultTopicArn = defaultTopicArn;
        integration.status = 'connected';
        integration.lastConnectionAt = new Date();
    }

    await integration.save();
    return integration;
};

// Test connection to AWS SNS
const testConnection = async (userId) => {
    const integration = await AwsSnsIntegration.findOne({ userId });
    if (!integration) throw new Error('AWS SNS integration not found');

    try {
        const sns = await createSnsClient(userId);
        
        // Test the connection by listing topics
        await sns.listTopics().promise();
        
        integration.status = 'connected';
        integration.lastConnectionAt = new Date();
        await integration.save();
        
        return { success: true, message: 'Successfully connected to AWS SNS' };
    } catch (error) {
        integration.status = 'failed';
        await integration.save();
        throw error;
    }
};

// List topics
const listTopics = async (userId) => {
    const sns = await createSnsClient(userId);
    const response = await sns.listTopics().promise();
    return response.Topics;
};

// Get topic attributes
const getTopicAttributes = async (userId, topicArn) => {
    const sns = await createSnsClient(userId);
    const params = {
        TopicArn: topicArn
    };
    
    const response = await sns.getTopicAttributes(params).promise();
    return response.Attributes;
};

// Create topic
const createTopic = async (userId, name, attributes = {}) => {
    const sns = await createSnsClient(userId);
    const params = {
        Name: name,
        Attributes: attributes
    };
    
    const response = await sns.createTopic(params).promise();
    return response;
};

// Delete topic
const deleteTopic = async (userId, topicArn) => {
    const sns = await createSnsClient(userId);
    const params = {
        TopicArn: topicArn
    };
    
    return sns.deleteTopic(params).promise();
};

// List subscriptions
const listSubscriptions = async (userId, topicArn = null) => {
    const sns = await createSnsClient(userId);
    const params = topicArn ? { TopicArn: topicArn } : {};
    
    const response = topicArn 
        ? await sns.listSubscriptionsByTopic(params).promise() 
        : await sns.listSubscriptions(params).promise();
    
    return topicArn ? response.Subscriptions : response.Subscriptions;
};

// Subscribe to topic
const subscribe = async (userId, topicArn, protocol, endpoint) => {
    const sns = await createSnsClient(userId);
    const params = {
        TopicArn: topicArn,
        Protocol: protocol, // 'http', 'https', 'email', 'email-json', 'sms', 'sqs', 'application', 'lambda'
        Endpoint: endpoint
    };
    
    const response = await sns.subscribe(params).promise();
    return response;
};

// Unsubscribe from topic
const unsubscribe = async (userId, subscriptionArn) => {
    const sns = await createSnsClient(userId);
    const params = {
        SubscriptionArn: subscriptionArn
    };
    
    return sns.unsubscribe(params).promise();
};

// Publish message to topic
const publishToTopic = async (userId, message, topicArn = null, subject = null) => {
    const integration = await AwsSnsIntegration.findOne({ userId });
    if (!integration) throw new Error('AWS SNS integration not found');
    
    const targetTopicArn = topicArn || integration.defaultTopicArn;
    if (!targetTopicArn) throw new Error('No topic ARN provided and no default topic ARN set');
    
    const sns = await createSnsClient(userId);
    const params: any = {
        Message: message,
        TopicArn: targetTopicArn
    };
    
    if (subject) {
        params.Subject = subject;
    }
    
    const response = await sns.publish(params).promise();
    return response;
};

// Send SMS directly (without topic)
const sendSms = async (userId, phoneNumber, message) => {
    const sns = await createSnsClient(userId);
    const params = {
        PhoneNumber: phoneNumber,
        Message: message
    };
    
    const response = await sns.publish(params).promise();
    return response;
};

// Check if phone number is opted out
const checkIfPhoneNumberIsOptedOut = async (userId, phoneNumber) => {
    const sns = await createSnsClient(userId);
    const params = {
        phoneNumber: phoneNumber
    };
    
    const response = await sns.checkIfPhoneNumberIsOptedOut(params).promise();
    return response.isOptedOut;
};

// List phone numbers opted out
const listPhoneNumbersOptedOut = async (userId) => {
    const sns = await createSnsClient(userId);
    const response = await sns.listPhoneNumbersOptedOut().promise();
    return response.phoneNumbers;
};

// Set SMS attributes
const setSmsAttributes = async (userId, attributes) => {
    const sns = await createSnsClient(userId);
    const params = {
        attributes: attributes
    };
    
    return sns.setSMSAttributes(params).promise();
};

// Get SMS attributes
const getSmsAttributes = async (userId, attributeNames = ['DefaultSMSType', 'DefaultSenderID', 'MonthlySpendLimit']) => {
    const sns = await createSnsClient(userId);
    const params = {
        attributes: attributeNames
    };
    
    const response = await sns.getSMSAttributes(params).promise();
    return response.attributes;
};

// Disconnect AWS SNS
const disconnectAwsSns = async (userId) => {
    const integration = await AwsSnsIntegration.findOne({ userId });
    if (!integration) throw new Error('AWS SNS integration not found');

    integration.status = 'disconnected';
    await integration.save();
    return integration;
};

// Get AWS SNS Integration Status
const getAwsSnsStatus = async (userId) => {
    const integration = await AwsSnsIntegration.findOne({ userId });
    if (!integration) throw new Error('AWS SNS integration not found');
    
    return {
        status: integration.status,
        lastConnectionAt: integration.lastConnectionAt,
        region: integration.region,
        defaultTopicArn: integration.defaultTopicArn
    };
};

export default { 
    setupAwsSns,
    testConnection,
    listTopics,
    getTopicAttributes,
    createTopic,
    deleteTopic,
    listSubscriptions,
    subscribe,
    unsubscribe,
    publishToTopic,
    sendSms,
    checkIfPhoneNumberIsOptedOut,
    listPhoneNumbersOptedOut,
    setSmsAttributes,
    getSmsAttributes,
    disconnectAwsSns,
    getAwsSnsStatus
 }; 