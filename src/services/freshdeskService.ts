const axios = require('axios');

const verifyCredentials = async (domain, apiKey) => {
    try {
        const response = await axios.get(`https://${domain}/api/v2/agents/me`, {
            headers: {
                'Authorization': `Basic ${Buffer.from(apiKey + ':X').toString('base64')}`,
                'Content-Type': 'application/json'
            }
        });

        const companyResponse = await axios.get(`https://${domain}/api/v2/company`, {
            headers: {
                'Authorization': `Basic ${Buffer.from(apiKey + ':X').toString('base64')}`,
                'Content-Type': 'application/json'
            }
        });

        return {
            isValid: true,
            userInfo: {
                id: response.data.id,
                email: response.data.contact.email,
                name: response.data.contact.name,
                role: response.data.role_type
            },
            accountInfo: {
                accountId: companyResponse.data.id,
                accountName: companyResponse.data.name,
                planType: companyResponse.data.plan_type,
                timezone: companyResponse.data.time_zone
            }
        };
    } catch (error) {
        return {
            isValid: false,
            error: error.message
        };
    }
};

const createTicket = async (domain, apiKey, ticketData) => {
    try {
        const response = await axios.post(`https://${domain}/api/v2/tickets`, ticketData, {
            headers: {
                'Authorization': `Basic ${Buffer.from(apiKey + ':X').toString('base64')}`,
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    } catch (error) {
        throw new Error(`Failed to create Freshdesk ticket: ${error.message}`);
    }
};

const updateTicket = async (domain, apiKey, ticketId, ticketData) => {
    try {
        const response = await axios.put(`https://${domain}/api/v2/tickets/${ticketId}`, ticketData, {
            headers: {
                'Authorization': `Basic ${Buffer.from(apiKey + ':X').toString('base64')}`,
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    } catch (error) {
        throw new Error(`Failed to update Freshdesk ticket: ${error.message}`);
    }
};

const getTicket = async (domain, apiKey, ticketId) => {
    try {
        const response = await axios.get(`https://${domain}/api/v2/tickets/${ticketId}`, {
            headers: {
                'Authorization': `Basic ${Buffer.from(apiKey + ':X').toString('base64')}`,
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    } catch (error) {
        throw new Error(`Failed to get Freshdesk ticket: ${error.message}`);
    }
};

const listTickets = async (domain, apiKey, filters = {}) => {
    try {
        const response = await axios.get(`https://${domain}/api/v2/tickets`, {
            headers: {
                'Authorization': `Basic ${Buffer.from(apiKey + ':X').toString('base64')}`,
                'Content-Type': 'application/json'
            },
            params: filters
        });
        return response.data;
    } catch (error) {
        throw new Error(`Failed to list Freshdesk tickets: ${error.message}`);
    }
};

const createContact = async (domain, apiKey, contactData) => {
    try {
        const response = await axios.post(`https://${domain}/api/v2/contacts`, contactData, {
            headers: {
                'Authorization': `Basic ${Buffer.from(apiKey + ':X').toString('base64')}`,
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    } catch (error) {
        throw new Error(`Failed to create Freshdesk contact: ${error.message}`);
    }
};

const updateContact = async (domain, apiKey, contactId, contactData) => {
    try {
        const response = await axios.put(`https://${domain}/api/v2/contacts/${contactId}`, contactData, {
            headers: {
                'Authorization': `Basic ${Buffer.from(apiKey + ':X').toString('base64')}`,
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    } catch (error) {
        throw new Error(`Failed to update Freshdesk contact: ${error.message}`);
    }
};

const searchContacts = async (domain, apiKey, query) => {
    try {
        const response = await axios.get(`https://${domain}/api/v2/search/contacts`, {
            headers: {
                'Authorization': `Basic ${Buffer.from(apiKey + ':X').toString('base64')}`,
                'Content-Type': 'application/json'
            },
            params: { query }
        });
        return response.data;
    } catch (error) {
        throw new Error(`Failed to search Freshdesk contacts: ${error.message}`);
    }
};

export default { 
    verifyCredentials,
    createTicket,
    updateTicket,
    getTicket,
    listTickets,
    createContact,
    updateContact,
    searchContacts
 }; 