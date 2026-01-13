import axios from 'axios';
import InstagramIntegration from '../models/InstagramIntegration';

const IG_API_VERSION = 'v18.0';
const IG_BASE_URL = `https://graph.instagram.com/${IG_API_VERSION}`;
const FB_BASE_URL = `https://graph.facebook.com/${IG_API_VERSION}`;

// Create Instagram API client
const createInstagramClient = async (userId: any) => {
    const integration = await InstagramIntegration.findOne({ userId });
    if (!integration || !integration.accessToken) {
        throw new Error('Instagram integration not found or invalid');
    }

    return {
        accessToken: integration.accessToken,
        igUserId: integration.igUserId,
        businessAccountId: integration.businessAccountId
    };
};

// Setup Instagram integration
const setupInstagram = async (userId: any, accessToken: any, igUserId: any, businessAccountId = null) => {
    try {
        // Validate access token
        const response = await axios.get(`${IG_BASE_URL}/me`, {
            params: { 
                access_token: accessToken,
                fields: 'id,username'
            }
        });

        let integration = await InstagramIntegration.findOne({ userId });
        if (!integration) {
            integration = new InstagramIntegration({ userId });
        }

        integration.accessToken = accessToken;
        integration.igUserId = igUserId;
        integration.username = response.data.username;
        integration.businessAccountId = businessAccountId;
        integration.status = 'active';
        integration.lastSync = new Date();
        
        await integration.save();
        return integration;
    } catch (error) {
        console.error('Error setting up Instagram integration:', error);
        throw error;
    }
};

// Test Instagram connection
const testConnection = async (userId) => {
    try {
        const client = await createInstagramClient(userId);
        const response = await axios.get(`${IG_BASE_URL}/me`, {
            params: { 
                access_token: client.accessToken,
                fields: 'id,username'
            }
        });
        
        const integration = await InstagramIntegration.findOne({ userId });
        integration.status = 'active';
        integration.lastSync = new Date();
        await integration.save();

        return { success: true, data: response.data };
    } catch (error) {
        console.error('Error testing Instagram connection:', error);
        const integration = await InstagramIntegration.findOne({ userId });
        if (integration) {
            integration.status = 'error';
            integration.error = error.message;
            await integration.save();
        }
        throw error;
    }
};

// Get User Profile
const getUserProfile = async (userId) => {
    try {
        const client = await createInstagramClient(userId);
        const response = await axios.get(`${IG_BASE_URL}/me`, {
            params: {
                access_token: client.accessToken,
                fields: 'id,username,account_type,media_count'
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error getting user profile:', error);
        throw error;
    }
};

// Get Media List
const getMediaList = async (userId, limit = 25) => {
    try {
        const client = await createInstagramClient(userId);
        const response = await axios.get(`${IG_BASE_URL}/me/media`, {
            params: {
                access_token: client.accessToken,
                fields: 'id,caption,media_type,media_url,permalink,thumbnail_url,timestamp,username',
                limit
            }
        });
        return response.data.data;
    } catch (error) {
        console.error('Error getting media list:', error);
        throw error;
    }
};

// Get Media Details
const getMediaDetails = async (userId, mediaId) => {
    try {
        const client = await createInstagramClient(userId);
        const response = await axios.get(`${IG_BASE_URL}/${mediaId}`, {
            params: {
                access_token: client.accessToken,
                fields: 'id,caption,media_type,media_url,permalink,thumbnail_url,timestamp,username,comments_count,like_count'
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error getting media details:', error);
        throw error;
    }
};

// Get Media Comments
const getMediaComments = async (userId, mediaId, limit = 50) => {
    try {
        const client = await createInstagramClient(userId);
        const response = await axios.get(`${IG_BASE_URL}/${mediaId}/comments`, {
            params: {
                access_token: client.accessToken,
                fields: 'id,text,timestamp,username',
                limit
            }
        });
        return response.data.data;
    } catch (error) {
        console.error('Error getting media comments:', error);
        throw error;
    }
};

// Reply to Comment
const replyToComment = async (userId, mediaId, text) => {
    try {
        const client = await createInstagramClient(userId);
        const response = await axios.post(
            `${IG_BASE_URL}/${mediaId}/comments`,
            null,
            {
                params: {
                    access_token: client.accessToken,
                    message: text
                }
            }
        );
        return response.data;
    } catch (error) {
        console.error('Error replying to comment:', error);
        throw error;
    }
};

// Get User Insights (Business accounts only)
const getUserInsights = async (userId, metric = ['impressions', 'reach', 'profile_views'], period = 'day') => {
    try {
        const client = await createInstagramClient(userId);
        if (!client.businessAccountId) {
            throw new Error('Business account required for insights');
        }

        const response = await axios.get(`${FB_BASE_URL}/${client.businessAccountId}/insights`, {
            params: {
                access_token: client.accessToken,
                metric: metric.join(','),
                period
            }
        });
        return response.data.data;
    } catch (error) {
        console.error('Error getting user insights:', error);
        throw error;
    }
};

// Get Media Insights (Business accounts only)
const getMediaInsights = async (userId, mediaId) => {
    try {
        const client = await createInstagramClient(userId);
        if (!client.businessAccountId) {
            throw new Error('Business account required for insights');
        }

        const response = await axios.get(`${IG_BASE_URL}/${mediaId}/insights`, {
            params: {
                access_token: client.accessToken,
                metric: 'engagement,impressions,reach,saved'
            }
        });
        return response.data.data;
    } catch (error) {
        console.error('Error getting media insights:', error);
        throw error;
    }
};

// Disconnect Instagram integration
const disconnectInstagram = async (userId) => {
    try {
        const integration = await InstagramIntegration.findOne({ userId });
        if (!integration) {
            throw new Error('Instagram integration not found');
        }

        integration.status = 'disconnected';
        integration.accessToken = null;
        integration.igUserId = null;
        integration.businessAccountId = null;
        integration.lastSync = new Date();
        
        await integration.save();
        return integration;
    } catch (error) {
        console.error('Error disconnecting Instagram:', error);
        throw error;
    }
};

// Get Instagram integration status
const getInstagramStatus = async (userId) => {
    try {
        const integration = await InstagramIntegration.findOne({ userId });
        if (!integration) {
            return { status: 'pending' };
        }
        return {
            status: integration.status,
            lastSync: integration.lastSync,
            error: integration.error,
            username: integration.username,
            isBusinessAccount: !!integration.businessAccountId
        };
    } catch (error) {
        console.error('Error getting Instagram status:', error);
        throw error;
    }
};

export default { 
    setupInstagram,
    testConnection,
    getUserProfile,
    getMediaList,
    getMediaDetails,
    getMediaComments,
    replyToComment,
    getUserInsights,
    getMediaInsights,
    disconnectInstagram,
    getInstagramStatus
 }; 