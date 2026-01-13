import hubspot from '@hubspot/api-client';

const verifyCredentials = async (accessToken: any) => {
    try {
        const hubspotClient = new hubspot.Client({ accessToken });
        
        // Get account information
        const accountInfo = await hubspotClient.crm.owners.ownersApi.getPage();
        const settings = await hubspotClient.settings.users.apiGetUser(accountInfo.results[0].id);
        
        return {
            isValid: true,
            userInfo: {
                id: settings.id,
                email: settings.email,
                fullName: `${settings.firstName} ${settings.lastName}`
            },
            accountInfo: {
                portalId: settings.portalId.toString(),
                portalName: settings.portalName,
                domain: settings.domain,
                currency: settings.currency,
                timeZone: settings.timeZone
            }
        };
    } catch (error) {
        return {
            isValid: false,
            error: error.message
        };
    }
};

const refreshAccessToken = async (clientId, clientSecret, refreshToken) => {
    try {
        const hubspotClient = new hubspot.Client();
        const result = await hubspotClient.oauth.tokensApi.createToken(
            'refresh_token',
            undefined,
            undefined,
            clientId,
            clientSecret,
            refreshToken
        );
        
        return {
            success: true,
            accessToken: result.accessToken,
            refreshToken: result.refreshToken
        };
    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
};

const createContact = async (contactData, accessToken) => {
    try {
        const hubspotClient = new hubspot.Client({ accessToken });
        const result = await hubspotClient.crm.contacts.basicApi.create({ properties: contactData });
        return result;
    } catch (error) {
        throw new Error(`Failed to create HubSpot contact: ${error.message}`);
    }
};

const updateContact = async (contactId, contactData, accessToken) => {
    try {
        const hubspotClient = new hubspot.Client({ accessToken });
        const result = await hubspotClient.crm.contacts.basicApi.update(contactId, { properties: contactData });
        return result;
    } catch (error) {
        throw new Error(`Failed to update HubSpot contact: ${error.message}`);
    }
};

const searchContacts = async (searchQuery, accessToken) => {
    try {
        const hubspotClient = new hubspot.Client({ accessToken });
        const result = await hubspotClient.crm.contacts.searchApi.doSearch({
            query: searchQuery,
            limit: 100
        });
        return result.results;
    } catch (error) {
        throw new Error(`Failed to search HubSpot contacts: ${error.message}`);
    }
};

const createDeal = async (dealData, accessToken) => {
    try {
        const hubspotClient = new hubspot.Client({ accessToken });
        const result = await hubspotClient.crm.deals.basicApi.create({ properties: dealData });
        return result;
    } catch (error) {
        throw new Error(`Failed to create HubSpot deal: ${error.message}`);
    }
};

const updateDeal = async (dealId, dealData, accessToken) => {
    try {
        const hubspotClient = new hubspot.Client({ accessToken });
        const result = await hubspotClient.crm.deals.basicApi.update(dealId, { properties: dealData });
        return result;
    } catch (error) {
        throw new Error(`Failed to update HubSpot deal: ${error.message}`);
    }
};

const searchDeals = async (searchQuery, accessToken) => {
    try {
        const hubspotClient = new hubspot.Client({ accessToken });
        const result = await hubspotClient.crm.deals.searchApi.doSearch({
            query: searchQuery,
            limit: 100
        });
        return result.results;
    } catch (error) {
        throw new Error(`Failed to search HubSpot deals: ${error.message}`);
    }
};

const getProperties = async (objectType, accessToken) => {
    try {
        const hubspotClient = new hubspot.Client({ accessToken });
        const result = await hubspotClient.crm.properties.coreApi.getAll(objectType);
        return result.results;
    } catch (error) {
        throw new Error(`Failed to get HubSpot properties: ${error.message}`);
    }
};

export default { 
    verifyCredentials,
    refreshAccessToken,
    createContact,
    updateContact,
    searchContacts,
    createDeal,
    updateDeal,
    searchDeals,
    getProperties
 }; 