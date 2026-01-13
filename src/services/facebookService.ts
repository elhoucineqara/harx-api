import axios from 'axios';
import FacebookIntegration from '../models/FacebookIntegration';

const FB_API_VERSION = 'v18.0';
const FB_BASE_URL = `https://graph.facebook.com/${FB_API_VERSION}`;

// Create Facebook API client
const createFacebookClient = async (userId: any) => {
    const integration = await FacebookIntegration.findOne({ userId });
    if (!integration || !integration.accessToken) {
        throw new Error('Facebook integration not found or invalid');
    }

    return {
        accessToken: integration.accessToken,
        pageAccessToken: integration.pageAccessToken,
        pageId: integration.pageId
    };
};

// Setup Facebook integration
const setupFacebook = async (userId: any, accessToken: any, pageId = null, pageAccessToken = null) => {
    try {
        // Validate access token
        const response = await axios.get(`${FB_BASE_URL}/me`, {
            params: { access_token: accessToken }
        });

        let integration = await FacebookIntegration.findOne({ userId });
        if (!integration) {
            integration = new FacebookIntegration({ userId });
        }

        integration.accessToken = accessToken;
        integration.pageId = pageId;
        integration.pageAccessToken = pageAccessToken;
        integration.status = 'active';
        integration.lastSync = new Date();
        
        await integration.save();
        return integration;
    } catch (error) {
        console.error('Error setting up Facebook integration:', error);
        throw error;
    }
};

// Test Facebook connection
const testConnection = async (userId) => {
    try {
        const client = await createFacebookClient(userId);
        const response = await axios.get(`${FB_BASE_URL}/me`, {
            params: { access_token: client.accessToken }
        });
        
        const integration = await FacebookIntegration.findOne({ userId });
        integration.status = 'active';
        integration.lastSync = new Date();
        await integration.save();

        return { success: true, data: response.data };
    } catch (error) {
        console.error('Error testing Facebook connection:', error);
        const integration = await FacebookIntegration.findOne({ userId });
        if (integration) {
            integration.status = 'error';
            integration.error = error.message;
            await integration.save();
        }
        throw error;
    }
};

// Get Facebook Pages
const getPages = async (userId) => {
    try {
        const client = await createFacebookClient(userId);
        const response = await axios.get(`${FB_BASE_URL}/me/accounts`, {
            params: { access_token: client.accessToken }
        });
        return response.data.data;
    } catch (error) {
        console.error('Error getting Facebook pages:', error);
        throw error;
    }
};

// Get Page Posts
const getPagePosts = async (userId, pageId = null) => {
    try {
        const client = await createFacebookClient(userId);
        const targetPageId = pageId || client.pageId;
        if (!targetPageId) {
            throw new Error('Page ID is required');
        }

        const response = await axios.get(`${FB_BASE_URL}/${targetPageId}/posts`, {
            params: { 
                access_token: client.pageAccessToken || client.accessToken,
                fields: 'id,message,created_time,type,permalink_url,attachments'
            }
        });
        return response.data.data;
    } catch (error) {
        console.error('Error getting page posts:', error);
        throw error;
    }
};

// Create Page Post
const createPost = async (userId, message, pageId = null, attachments = null) => {
    try {
        const client = await createFacebookClient(userId);
        const targetPageId = pageId || client.pageId;
        if (!targetPageId) {
            throw new Error('Page ID is required');
        }

        const postData: any = { message };
        if (attachments) {
            postData.attached_media = attachments;
        }

        const response = await axios.post(
            `${FB_BASE_URL}/${targetPageId}/feed`,
            postData,
            {
                params: { access_token: client.pageAccessToken || client.accessToken }
            }
        );
        return response.data;
    } catch (error) {
        console.error('Error creating post:', error);
        throw error;
    }
};

// Get Post Comments
const getPostComments = async (userId, postId) => {
    try {
        const client = await createFacebookClient(userId);
        const response = await axios.get(`${FB_BASE_URL}/${postId}/comments`, {
            params: { 
                access_token: client.pageAccessToken || client.accessToken,
                fields: 'id,message,created_time,from'
            }
        });
        return response.data.data;
    } catch (error) {
        console.error('Error getting post comments:', error);
        throw error;
    }
};

// Reply to Comment
const replyToComment = async (userId, commentId, message) => {
    try {
        const client = await createFacebookClient(userId);
        const response = await axios.post(
            `${FB_BASE_URL}/${commentId}/comments`,
            { message },
            {
                params: { access_token: client.pageAccessToken || client.accessToken }
            }
        );
        return response.data;
    } catch (error) {
        console.error('Error replying to comment:', error);
        throw error;
    }
};

// Get Page Insights
const getPageInsights = async (userId, pageId = null, metrics = ['page_impressions', 'page_engaged_users']) => {
    try {
        const client = await createFacebookClient(userId);
        const targetPageId = pageId || client.pageId;
        if (!targetPageId) {
            throw new Error('Page ID is required');
        }

        const response = await axios.get(`${FB_BASE_URL}/${targetPageId}/insights`, {
            params: {
                access_token: client.pageAccessToken || client.accessToken,
                metric: metrics.join(','),
                period: 'day'
            }
        });
        return response.data.data;
    } catch (error) {
        console.error('Error getting page insights:', error);
        throw error;
    }
};

// Disconnect Facebook integration
const disconnectFacebook = async (userId) => {
    try {
        const integration = await FacebookIntegration.findOne({ userId });
        if (!integration) {
            throw new Error('Facebook integration not found');
        }

        integration.status = 'disconnected';
        integration.accessToken = null;
        integration.pageAccessToken = null;
        integration.pageId = null;
        integration.lastSync = new Date();
        
        await integration.save();
        return integration;
    } catch (error) {
        console.error('Error disconnecting Facebook:', error);
        throw error;
    }
};

// Get Facebook integration status
const getFacebookStatus = async (userId) => {
    try {
        const integration = await FacebookIntegration.findOne({ userId });
        if (!integration) {
            return { status: 'pending' };
        }
        return {
            status: integration.status,
            lastSync: integration.lastSync,
            error: integration.error,
            hasPage: !!integration.pageId
        };
    } catch (error) {
        console.error('Error getting Facebook status:', error);
        throw error;
    }
};

export default { 
    setupFacebook,
    testConnection,
    getPages,
    getPagePosts,
    createPost,
    getPostComments,
    replyToComment,
    getPageInsights,
    disconnectFacebook,
    getFacebookStatus
 }; 