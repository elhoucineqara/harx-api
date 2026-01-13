import axios from 'axios';

export const verifyCredentials = async (tenantId: string, clientId: string, clientSecret: string, accessToken: string) => {
    try {
        const response = await axios.get(`https://graph.microsoft.com/v1.0/me`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });

        const tenantResponse = await axios.get(`https://graph.microsoft.com/v1.0/organization`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });

        return {
            isValid: true,
            userInfo: {
                id: response.data.id,
                email: response.data.userPrincipalName,
                displayName: response.data.displayName,
                userPrincipalName: response.data.userPrincipalName,
                jobTitle: response.data.jobTitle,
                department: response.data.department,
                roles: response.data.roles
            },
            accountInfo: {
                tenantName: tenantResponse.data.value[0].displayName,
                subscriptionId: tenantResponse.data.value[0].id,
                licenseType: tenantResponse.data.value[0].verifiedDomains[0].isDefault,
                region: tenantResponse.data.value[0].country,
                settings: tenantResponse.data.value[0].settings
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
        const response = await axios.post('https://graph.microsoft.com/v1.0/me/events', meetingData, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    } catch (error) {
        throw new Error(`Failed to create Teams meeting: ${error.message}`);
    }
};

export const getMeeting = async (accessToken: string, meetingId: string) => {
    try {
        const response = await axios.get(`https://graph.microsoft.com/v1.0/me/events/${meetingId}`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    } catch (error) {
        throw new Error(`Failed to get Teams meeting: ${error.message}`);
    }
};

export const listMeetings = async (accessToken: string, filters: any = {}) => {
    try {
        const response = await axios.get('https://graph.microsoft.com/v1.0/me/events', {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            params: filters
        });
        return response.data;
    } catch (error) {
        throw new Error(`Failed to list Teams meetings: ${error.message}`);
    }
};

export const createTeam = async (accessToken: string, teamData: any) => {
    try {
        const response = await axios.post('https://graph.microsoft.com/v1.0/teams', teamData, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    } catch (error) {
        throw new Error(`Failed to create Teams team: ${error.message}`);
    }
};

export const getTeam = async (accessToken: string, teamId: string) => {
    try {
        const response = await axios.get(`https://graph.microsoft.com/v1.0/teams/${teamId}`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    } catch (error) {
        throw new Error(`Failed to get Teams team: ${error.message}`);
    }
};

export const listTeams = async (accessToken: string, filters: any = {}) => {
    try {
        const response = await axios.get('https://graph.microsoft.com/v1.0/me/joinedTeams', {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            params: filters
        });
        return response.data;
    } catch (error) {
        throw new Error(`Failed to list Teams teams: ${error.message}`);
    }
};
 