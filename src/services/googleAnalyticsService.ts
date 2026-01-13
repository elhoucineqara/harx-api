import { google } from 'googleapis';
import GoogleAnalyticsIntegration from '../models/GoogleAnalyticsIntegration';

// Create OAuth2 client for Universal Analytics (UA)
const createOAuth2Client = async (userId: any) => {
    const integration = await GoogleAnalyticsIntegration.findOne({ userId });
    if (!integration) throw new Error('Google Analytics integration not found');

    const oAuth2Client = new google.auth.OAuth2(
        integration.clientId,
        integration.clientSecret,
        'https://developers.google.com/oauthplayground'
    );
    
    // Set credentials immediately so we can use methods on the client
    oAuth2Client.setCredentials({
        access_token: integration.accessToken,
        refresh_token: integration.refreshToken
    });
    
    // Check if token is expired or about to expire (within 5 minutes)
    const isExpired = !integration.tokenExpiresAt || 
                      integration.tokenExpiresAt < new Date(Date.now() + 5 * 60 * 1000);

    if (isExpired && integration.refreshToken) {
        try {
            const { credentials } = await oAuth2Client.refreshAccessToken();
            
            integration.accessToken = credentials.access_token;
            if (credentials.refresh_token) {
                integration.refreshToken = credentials.refresh_token;
            }
            
            if (credentials.expiry_date) {
                integration.tokenExpiresAt = new Date(credentials.expiry_date);
            }
            
            integration.status = 'connected';
            integration.lastConnectionAt = new Date();
            
            await integration.save();
        } catch (error) {
            integration.status = 'failed';
            await integration.save();
            throw new Error(`Failed to refresh token: ${error.message || error}`);
        }
    }
    
    return oAuth2Client;
};

// Setup Google Analytics Integration
const setupGoogleAnalytics = async (userId: any, clientId: string, clientSecret: string, refreshToken: string, viewId = null, isGA4 = false, measurementId = null, apiSecret = null) => {
    let integration = await GoogleAnalyticsIntegration.findOne({ userId });

    if (!integration) {
        integration = new GoogleAnalyticsIntegration({
            userId,
            clientId,
            clientSecret,
            refreshToken,
            viewId,
            isGA4,
            measurementId,
            apiSecret,
            status: 'connected',
            lastConnectionAt: new Date()
        });
    } else {
        integration.clientId = clientId;
        integration.clientSecret = clientSecret;
        integration.refreshToken = refreshToken;
        if (viewId) integration.viewId = viewId;
        integration.isGA4 = isGA4;
        if (measurementId) integration.measurementId = measurementId;
        if (apiSecret) integration.apiSecret = apiSecret;
        integration.status = 'connected';
        integration.lastConnectionAt = new Date();
    }

    await integration.save();
    return integration;
};

// Get access token
const getAccessToken = async (userId) => {
    const integration = await GoogleAnalyticsIntegration.findOne({ userId });
    if (!integration) throw new Error('Google Analytics integration not found');

    const auth = await createOAuth2Client(userId);
    const tokens = await auth.getAccessToken();
    return tokens.token;
};

// List accounts
const listAccounts = async (userId) => {
    const auth = await createOAuth2Client(userId);
    const analytics = google.analytics('v3');
    
    const response = await analytics.management.accounts.list({
        auth
    });
    
    return response.data.items || [];
};

// List properties
const listProperties = async (userId, accountId) => {
    const auth = await createOAuth2Client(userId);
    const analytics = google.analytics('v3');
    
    const response = await analytics.management.webproperties.list({
        auth,
        accountId
    });
    
    return response.data.items || [];
};

// List views (profiles)
const listViews = async (userId, accountId, propertyId) => {
    const auth = await createOAuth2Client(userId);
    const analytics = google.analytics('v3');
    
    const response = await analytics.management.profiles.list({
        auth,
        accountId,
        webPropertyId: propertyId
    });
    
    return response.data.items || [];
};

// Get report data (Universal Analytics)
const getReportData = async (userId, metrics = ['ga:sessions', 'ga:users'], dimensions = ['ga:date'], startDate = '7daysAgo', endDate = 'today') => {
    const integration = await GoogleAnalyticsIntegration.findOne({ userId });
    if (!integration) throw new Error('Google Analytics integration not found');
    if (!integration.viewId) throw new Error('View ID not configured');
    
    const auth = await createOAuth2Client(userId);
    const analyticsReporting = google.analyticsreporting('v4');
    
    const response = await analyticsReporting.reports.batchGet({
        auth,
        requestBody: {
            reportRequests: [
                {
                    viewId: integration.viewId,
                    dateRanges: [
                        {
                            startDate,
                            endDate
                        }
                    ],
                    metrics: metrics.map(metric => ({ expression: metric })),
                    dimensions: dimensions.map(dimension => ({ name: dimension }))
                }
            ]
        }
    });
    
    return response.data.reports[0];
};

// Get GA4 data (if using GA4)
const getGA4Data = async (userId, metrics = ['activeUsers'], dimensions = ['date'], startDate = '7daysAgo', endDate = 'today') => {
    const integration = await GoogleAnalyticsIntegration.findOne({ userId });
    if (!integration) throw new Error('Google Analytics integration not found');
    if (!integration.isGA4) throw new Error('This method is only for GA4 properties');
    
    const auth = await createOAuth2Client(userId);
    const analyticsData = google.analyticsdata('v1beta');
    
    // Get the property ID from the integration
    const propertyId = integration.viewId; // In GA4, this would be the property ID
    
    const response = await analyticsData.properties.runReport({
        auth,
        property: `properties/${propertyId}`,
        requestBody: {
            dateRanges: [
                {
                    startDate,
                    endDate
                }
            ],
            metrics: metrics.map(metric => ({ name: metric })),
            dimensions: dimensions.map(dimension => ({ name: dimension }))
        }
    });
    
    return response.data;
};

// Disconnect Google Analytics
const disconnectGoogleAnalytics = async (userId) => {
    const integration = await GoogleAnalyticsIntegration.findOne({ userId });
    if (!integration) throw new Error('Google Analytics integration not found');

    integration.status = 'disconnected';
    await integration.save();
    return integration;
};

// Get Google Analytics Integration Status
const getGoogleAnalyticsStatus = async (userId) => {
    const integration = await GoogleAnalyticsIntegration.findOne({ userId });
    if (!integration) throw new Error('Google Analytics integration not found');
    
    return {
        status: integration.status,
        lastConnectionAt: integration.lastConnectionAt,
        isGA4: integration.isGA4,
        viewId: integration.viewId,
        measurementId: integration.measurementId
    };
};

export default { 
    setupGoogleAnalytics,
    getAccessToken,
    listAccounts,
    listProperties,
    listViews,
    getReportData,
    getGA4Data,
    disconnectGoogleAnalytics,
    getGoogleAnalyticsStatus
 }; 