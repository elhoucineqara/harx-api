const jsforce = require('jsforce');

export const verifyCredentials = async (instanceUrl, accessToken) => {
    try {
        const conn = new jsforce.Connection({
            instanceUrl: instanceUrl,
            accessToken: accessToken
        });

        const userInfo = await conn.identity();
        const orgInfo = await conn.query('SELECT Id, Name FROM Organization LIMIT 1');

        return {
            isValid: true,
            userInfo: {
                id: userInfo.user_id,
                username: userInfo.username,
                email: userInfo.email
            },
            organizationId: orgInfo.records[0].Id,
            organizationName: orgInfo.records[0].Name
        };
    } catch (error) {
        return {
            isValid: false,
            error: error.message
        };
    }
};

export const refreshAccessToken = async (clientId, clientSecret, refreshToken, instanceUrl) => {
    try {
        const conn = new jsforce.Connection({
            oauth2: {
                clientId: clientId,
                clientSecret: clientSecret
            },
            instanceUrl: instanceUrl
        });

        const response = await conn.oauth2.refreshToken(refreshToken);
        return {
            success: true,
            accessToken: response.access_token
        };
    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
};

export const createRecord = async (objectName, data, instanceUrl, accessToken) => {
    try {
        const conn = new jsforce.Connection({
            instanceUrl: instanceUrl,
            accessToken: accessToken
        });

        const result = await conn.sobject(objectName).create(data);
        return result;
    } catch (error) {
        throw new Error(`Failed to create Salesforce record: ${error.message}`);
    }
};

export const queryRecords = async (soql, instanceUrl, accessToken) => {
    try {
        const conn = new jsforce.Connection({
            instanceUrl: instanceUrl,
            accessToken: accessToken
        });

        const result = await conn.query(soql);
        return result.records;
    } catch (error) {
        throw new Error(`Failed to query Salesforce records: ${error.message}`);
    }
};

export const updateRecord = async (objectName, id, data, instanceUrl, accessToken) => {
    try {
        const conn = new jsforce.Connection({
            instanceUrl: instanceUrl,
            accessToken: accessToken
        });

        const result = await conn.sobject(objectName).update({ Id: id, ...data });
        return result;
    } catch (error) {
        throw new Error(`Failed to update Salesforce record: ${error.message}`);
    }
};

export const describeObject = async (objectName, instanceUrl, accessToken) => {
    try {
        const conn = new jsforce.Connection({
            instanceUrl: instanceUrl,
            accessToken: accessToken
        });

        const result = await conn.describe(objectName);
        return result;
    } catch (error) {
        throw new Error(`Failed to describe Salesforce object: ${error.message}`);
    }
}; 