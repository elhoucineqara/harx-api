const axios = require('axios');

const verifyCredentials = async (tenantId, clientId, clientSecret, accessToken) => {
    try {
        const response = await axios.get('https://graph.microsoft.com/v1.0/me', {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });

        const tenantResponse = await axios.get('https://graph.microsoft.com/v1.0/organization', {
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

const sendEmail = async (accessToken, emailData) => {
    try {
        const response = await axios.post('https://graph.microsoft.com/v1.0/me/sendMail', emailData, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    } catch (error) {
        throw new Error(`Failed to send Outlook email: ${error.message}`);
    }
};

const createDraft = async (accessToken, draftData) => {
    try {
        const response = await axios.post('https://graph.microsoft.com/v1.0/me/messages', draftData, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    } catch (error) {
        throw new Error(`Failed to create Outlook draft: ${error.message}`);
    }
};

const getDraft = async (accessToken, draftId) => {
    try {
        const response = await axios.get(`https://graph.microsoft.com/v1.0/me/messages/${draftId}`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    } catch (error) {
        throw new Error(`Failed to get Outlook draft: ${error.message}`);
    }
};

const listDrafts = async (accessToken, filters = {}) => {
    try {
        const response = await axios.get('https://graph.microsoft.com/v1.0/me/messages', {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            params: filters
        });
        return response.data;
    } catch (error) {
        throw new Error(`Failed to list Outlook drafts: ${error.message}`);
    }
};

const createCalendarEvent = async (accessToken, eventData) => {
    try {
        const response = await axios.post('https://graph.microsoft.com/v1.0/me/events', eventData, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    } catch (error) {
        throw new Error(`Failed to create Outlook calendar event: ${error.message}`);
    }
};

const getCalendarEvent = async (accessToken, eventId) => {
    try {
        const response = await axios.get(`https://graph.microsoft.com/v1.0/me/events/${eventId}`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    } catch (error) {
        throw new Error(`Failed to get Outlook calendar event: ${error.message}`);
    }
};

const listCalendarEvents = async (accessToken, filters = {}) => {
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
        throw new Error(`Failed to list Outlook calendar events: ${error.message}`);
    }
};

export default { 
    verifyCredentials,
    sendEmail,
    createDraft,
    getDraft,
    listDrafts,
    createCalendarEvent,
    getCalendarEvent,
    listCalendarEvents
 }; 