import axios from 'axios';

export const verifyCredentials = async (accountId: string, clientId: string, clientSecret: string, accessToken: string) => {
    try {
        const response = await axios.get('https://api.zoom.us/v2/users/me', {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });

        const accountResponse = await axios.get(`https://api.zoom.us/v2/accounts/${accountId}`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });

        return {
            isValid: true,
            userInfo: {
                id: response.data.id,
                email: response.data.email,
                firstName: response.data.first_name,
                lastName: response.data.last_name,
                role: response.data.role_name,
                personalMeetingId: response.data.pmi,
                timezone: response.data.timezone,
                language: response.data.language,
                status: response.data.status
            },
            accountInfo: {
                accountName: accountResponse.data.account_name,
                accountType: accountResponse.data.account_type,
                planType: accountResponse.data.plan_type,
                hostCount: accountResponse.data.host_count,
                created: accountResponse.data.created_at,
                settings: accountResponse.data.settings
            }
        };
    } catch (error) {
        return {
            isValid: false,
            error: error.message
        };
    }
};

export const createMeeting = async (accessToken: string, meetingData: any) => {
    try {
        const response = await axios.post('https://api.zoom.us/v2/users/me/meetings', meetingData, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    } catch (error) {
        throw new Error(`Failed to create Zoom meeting: ${error.message}`);
    }
};

export const getMeeting = async (accessToken: string, meetingId: string) => {
    try {
        const response = await axios.get(`https://api.zoom.us/v2/meetings/${meetingId}`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    } catch (error) {
        throw new Error(`Failed to get Zoom meeting: ${error.message}`);
    }
};

export const listMeetings = async (accessToken: string, filters = {}) => {
    try {
        const response = await axios.get('https://api.zoom.us/v2/users/me/meetings', {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            params: filters
        });
        return response.data;
    } catch (error) {
        throw new Error(`Failed to list Zoom meetings: ${error.message}`);
    }
};

export const createWebinar = async (accessToken: string, webinarData: any) => {
    try {
        const response = await axios.post('https://api.zoom.us/v2/users/me/webinars', webinarData, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    } catch (error) {
        throw new Error(`Failed to create Zoom webinar: ${error.message}`);
    }
};

export const getWebinar = async (accessToken: string, webinarId: string) => {
    try {
        const response = await axios.get(`https://api.zoom.us/v2/webinars/${webinarId}`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    } catch (error) {
        throw new Error(`Failed to get Zoom webinar: ${error.message}`);
    }
};

export const listWebinars = async (accessToken: string, filters = {}) => {
    try {
        const response = await axios.get('https://api.zoom.us/v2/users/me/webinars', {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            params: filters
        });
        return response.data;
    } catch (error) {
        throw new Error(`Failed to list Zoom webinars: ${error.message}`);
    }
};

 