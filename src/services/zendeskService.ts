import axios from 'axios';

export const verifyCredentials = async (subdomain, email, apiToken) => {
    try {
        const auth = Buffer.from(`${email}/token:${apiToken}`).toString('base64');
        const response = await axios.get(`https://${subdomain}.zendesk.com/api/v2/users/me`, {
            headers: {
                'Authorization': `Basic ${auth}`,
                'Content-Type': 'application/json'
            }
        });

        const accountResponse = await axios.get(`https://${subdomain}.zendesk.com/api/v2/account/settings`, {
            headers: {
                'Authorization': `Basic ${auth}`,
                'Content-Type': 'application/json'
            }
        });

        return {
            isValid: true,
            userInfo: {
                id: response.data.user.id,
                email: response.data.user.email,
                name: response.data.user.name,
                role: response.data.user.role,
                locale: response.data.user.locale
            },
            accountInfo: {
                accountId: accountResponse.data.settings.account_id,
                accountName: accountResponse.data.settings.brand_name,
                planType: accountResponse.data.settings.plan_type,
                timezone: accountResponse.data.settings.timezone,
                locale: accountResponse.data.settings.locale
            }
        };
    } catch (error: any) {
        return {
            isValid: false,
            error: error.message
        };
    }
};

export const createTicket = async (subdomain, email, apiToken, ticketData) => {
    try {
        const auth = Buffer.from(`${email}/token:${apiToken}`).toString('base64');
        const response = await axios.post(`https://${subdomain}.zendesk.com/api/v2/tickets`, 
            { ticket: ticketData },
            {
                headers: {
                    'Authorization': `Basic ${auth}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        return response.data.ticket;
    } catch (error: any) {
        throw new Error(`Failed to create Zendesk ticket: ${error.message}`);
    }
};

export const updateTicket = async (subdomain, email, apiToken, ticketId, ticketData) => {
    try {
        const auth = Buffer.from(`${email}/token:${apiToken}`).toString('base64');
        const response = await axios.put(`https://${subdomain}.zendesk.com/api/v2/tickets/${ticketId}`,
            { ticket: ticketData },
            {
                headers: {
                    'Authorization': `Basic ${auth}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        return response.data.ticket;
    } catch (error: any) {
        throw new Error(`Failed to update Zendesk ticket: ${error.message}`);
    }
};

export const getTicket = async (subdomain, email, apiToken, ticketId) => {
    try {
        const auth = Buffer.from(`${email}/token:${apiToken}`).toString('base64');
        const response = await axios.get(`https://${subdomain}.zendesk.com/api/v2/tickets/${ticketId}`, {
            headers: {
                'Authorization': `Basic ${auth}`,
                'Content-Type': 'application/json'
            }
        });
        return response.data.ticket;
    } catch (error: any) {
        throw new Error(`Failed to get Zendesk ticket: ${error.message}`);
    }
};

export const searchTickets = async (subdomain, email, apiToken, query) => {
    try {
        const auth = Buffer.from(`${email}/token:${apiToken}`).toString('base64');
        const response = await axios.get(`https://${subdomain}.zendesk.com/api/v2/search`, {
            headers: {
                'Authorization': `Basic ${auth}`,
                'Content-Type': 'application/json'
            },
            params: {
                query: `type:ticket ${query}`
            }
        });
        return response.data.results;
    } catch (error: any) {
        throw new Error(`Failed to search Zendesk tickets: ${error.message}`);
    }
};

export const createUser = async (subdomain, email, apiToken, userData) => {
    try {
        const auth = Buffer.from(`${email}/token:${apiToken}`).toString('base64');
        const response = await axios.post(`https://${subdomain}.zendesk.com/api/v2/users`,
            { user: userData },
            {
                headers: {
                    'Authorization': `Basic ${auth}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        return response.data.user;
    } catch (error: any) {
        throw new Error(`Failed to create Zendesk user: ${error.message}`);
    }
};

export const updateUser = async (subdomain, email, apiToken, userId, userData) => {
    try {
        const auth = Buffer.from(`${email}/token:${apiToken}`).toString('base64');
        const response = await axios.put(`https://${subdomain}.zendesk.com/api/v2/users/${userId}`,
            { user: userData },
            {
                headers: {
                    'Authorization': `Basic ${auth}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        return response.data.user;
    } catch (error: any) {
        throw new Error(`Failed to update Zendesk user: ${error.message}`);
    }
};

export const searchUsers = async (subdomain, email, apiToken, query) => {
    try {
        const auth = Buffer.from(`${email}/token:${apiToken}`).toString('base64');
        const response = await axios.get(`https://${subdomain}.zendesk.com/api/v2/search`, {
            headers: {
                'Authorization': `Basic ${auth}`,
                'Content-Type': 'application/json'
            },
            params: {
                query: `type:user ${query}`
            }
        });
        return response.data.results;
    } catch (error: any) {
        throw new Error(`Failed to search Zendesk users: ${error.message}`);
    }
};

export default { 
    verifyCredentials,
    createTicket,
    updateTicket,
    getTicket,
    searchTickets,
    createUser,
    updateUser,
    searchUsers
 };
 