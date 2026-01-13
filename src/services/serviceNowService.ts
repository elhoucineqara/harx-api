const axios = require('axios');

export const verifyCredentials = async (instanceUrl, username, password) => {
    try {
        const auth = Buffer.from(`${username}:${password}`).toString('base64');
        const response = await axios.get(`${instanceUrl}/api/now/v2/table/sys_user?sysparm_query=user_name=${username}`, {
            headers: {
                'Authorization': `Basic ${auth}`,
                'Content-Type': 'application/json'
            }
        });

        const instanceResponse = await axios.get(`${instanceUrl}/api/now/v2/info/system_properties`, {
            headers: {
                'Authorization': `Basic ${auth}`,
                'Content-Type': 'application/json'
            }
        });

        const userInfo = response.data.result[0];
        const systemInfo = instanceResponse.data.result;

        return {
            isValid: true,
            userInfo: {
                id: userInfo.sys_id,
                username: userInfo.user_name,
                email: userInfo.email,
                roles: userInfo.roles ? userInfo.roles.split(',') : [],
                department: userInfo.department
            },
            accountInfo: {
                instanceName: systemInfo.instance_name,
                instanceVersion: systemInfo.version,
                datacenter: systemInfo.datacenter,
                timezone: systemInfo.time_zone
            }
        };
    } catch (error) {
        return {
            isValid: false,
            error: error.message
        };
    }
};

export const createIncident = async (instanceUrl, username, password, incidentData) => {
    try {
        const auth = Buffer.from(`${username}:${password}`).toString('base64');
        const response = await axios.post(`${instanceUrl}/api/now/v2/table/incident`,
            incidentData,
            {
                headers: {
                    'Authorization': `Basic ${auth}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        return response.data.result;
    } catch (error) {
        throw new Error(`Failed to create ServiceNow incident: ${error.message}`);
    }
};

export const updateIncident = async (instanceUrl, username, password, incidentId, incidentData) => {
    try {
        const auth = Buffer.from(`${username}:${password}`).toString('base64');
        const response = await axios.put(`${instanceUrl}/api/now/v2/table/incident/${incidentId}`,
            incidentData,
            {
                headers: {
                    'Authorization': `Basic ${auth}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        return response.data.result;
    } catch (error) {
        throw new Error(`Failed to update ServiceNow incident: ${error.message}`);
    }
};

export const getIncident = async (instanceUrl, username, password, incidentId) => {
    try {
        const auth = Buffer.from(`${username}:${password}`).toString('base64');
        const response = await axios.get(`${instanceUrl}/api/now/v2/table/incident/${incidentId}`, {
            headers: {
                'Authorization': `Basic ${auth}`,
                'Content-Type': 'application/json'
            }
        });
        return response.data.result;
    } catch (error) {
        throw new Error(`Failed to get ServiceNow incident: ${error.message}`);
    }
};

export const searchIncidents = async (instanceUrl, username, password, query) => {
    try {
        const auth = Buffer.from(`${username}:${password}`).toString('base64');
        const response = await axios.get(`${instanceUrl}/api/now/v2/table/incident`, {
            headers: {
                'Authorization': `Basic ${auth}`,
                'Content-Type': 'application/json'
            },
            params: {
                sysparm_query: query
            }
        });
        return response.data.result;
    } catch (error) {
        throw new Error(`Failed to search ServiceNow incidents: ${error.message}`);
    }
};

export const createUser = async (instanceUrl, username, password, userData) => {
    try {
        const auth = Buffer.from(`${username}:${password}`).toString('base64');
        const response = await axios.post(`${instanceUrl}/api/now/v2/table/sys_user`,
            userData,
            {
                headers: {
                    'Authorization': `Basic ${auth}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        return response.data.result;
    } catch (error) {
        throw new Error(`Failed to create ServiceNow user: ${error.message}`);
    }
};

export const updateUser = async (instanceUrl, username, password, userId, userData) => {
    try {
        const auth = Buffer.from(`${username}:${password}`).toString('base64');
        const response = await axios.put(`${instanceUrl}/api/now/v2/table/sys_user/${userId}`,
            userData,
            {
                headers: {
                    'Authorization': `Basic ${auth}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        return response.data.result;
    } catch (error) {
        throw new Error(`Failed to update ServiceNow user: ${error.message}`);
    }
};

export const searchUsers = async (instanceUrl, username, password, query) => {
    try {
        const auth = Buffer.from(`${username}:${password}`).toString('base64');
        const response = await axios.get(`${instanceUrl}/api/now/v2/table/sys_user`, {
            headers: {
                'Authorization': `Basic ${auth}`,
                'Content-Type': 'application/json'
            },
            params: {
                sysparm_query: query
            }
        });
        return response.data.result;
    } catch (error) {
        throw new Error(`Failed to search ServiceNow users: ${error.message}`);
    }
};

 