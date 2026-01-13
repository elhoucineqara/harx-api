import axios from 'axios';

export const verifyCredentials = async (serverUrl: string, clientId: string, clientSecret: string, accessToken: string) => {
    try {
        const response = await axios.get(`${serverUrl}/restapi/v1.0/account/~/extension/~`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });

        const accountResponse = await axios.get(`${serverUrl}/restapi/v1.0/account/~/`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });

        return {
            isValid: true,
            userInfo: {
                id: response.data.id,
                email: response.data.contact.email,
                name: response.data.contact.name,
                extensionNumber: response.data.extensionNumber,
                extensionType: response.data.type,
                permissions: response.data.permissions
            },
            accountInfo: {
                accountId: accountResponse.data.id,
                mainNumber: accountResponse.data.mainNumber,
                companyName: accountResponse.data.companyName,
                status: accountResponse.data.status,
                serviceInfo: accountResponse.data.serviceInfo
            }
        };
    } catch (error) {
        return {
            isValid: false,
            error: error.message
        };
    }
};

export const createMeeting = async (serverUrl: string, accessToken: string, meetingData: any) => {
    try {
        const response = await axios.post(`${serverUrl}/restapi/v1.0/account/~/extension/~/meeting`, meetingData, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    } catch (error) {
        throw new Error(`Failed to create RingCentral meeting: ${error.message}`);
    }
};

export const getMeeting = async (serverUrl: string, accessToken: string, meetingId: string) => {
    try {
        const response = await axios.get(`${serverUrl}/restapi/v1.0/account/~/extension/~/meeting/${meetingId}`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    } catch (error) {
        throw new Error(`Failed to get RingCentral meeting: ${error.message}`);
    }
};

export const listMeetings = async (serverUrl: string, accessToken: string, filters = {}) => {
    try {
        const response = await axios.get(`${serverUrl}/restapi/v1.0/account/~/extension/~/meeting`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            params: filters
        });
        return response.data;
    } catch (error) {
        throw new Error(`Failed to list RingCentral meetings: ${error.message}`);
    }
};

export const createCall = async (serverUrl: string, accessToken: string, callData: any) => {
    try {
        const response = await axios.post(`${serverUrl}/restapi/v1.0/account/~/extension/~/call-out`, callData, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    } catch (error) {
        throw new Error(`Failed to create RingCentral call: ${error.message}`);
    }
};

export const getCall = async (serverUrl: string, accessToken: string, callId: string) => {
    try {
        const response = await axios.get(`${serverUrl}/restapi/v1.0/account/~/extension/~/call-log/${callId}`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    } catch (error) {
        throw new Error(`Failed to get RingCentral call: ${error.message}`);
    }
};

export const listCalls = async (serverUrl: string, accessToken: string, filters = {}) => {
    try {
        const response = await axios.get(`${serverUrl}/restapi/v1.0/account/~/extension/~/call-log`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            params: filters
        });
        return response.data;
    } catch (error) {
        throw new Error(`Failed to list RingCentral calls: ${error.message}`);
    }
};

 