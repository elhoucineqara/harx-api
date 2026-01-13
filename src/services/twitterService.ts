const axios = require('axios');
const TwitterIntegration = require('../../models/twitterIntegration');

const TWITTER_API_VERSION = '2';
const TWITTER_BASE_URL = `https://api.twitter.com/${TWITTER_API_VERSION}`;

// Create Twitter API client
const createTwitterClient = async (userId) => {
    const integration = await TwitterIntegration.findOne({ userId });
    if (!integration || !integration.accessToken) {
        throw new Error('Twitter integration not found or invalid');
    }

    return {
        accessToken: integration.accessToken,
        accessTokenSecret: integration.accessTokenSecret,
        apiKey: integration.apiKey,
        apiKeySecret: integration.apiKeySecret,
        bearerToken: integration.bearerToken,
        twitterUserId: integration.twitterUserId
    };
};

// Setup Twitter integration
const setupTwitter = async (userId, apiKey, apiKeySecret, accessToken, accessTokenSecret, bearerToken = null) => {
    try {
        // Validate credentials by making a test API call
        const headers = {
            'Authorization': `Bearer ${bearerToken || accessToken}`,
            'Content-Type': 'application/json'
        };
        
        await axios.get(`${TWITTER_BASE_URL}/users/me`, { headers });

        let integration = await TwitterIntegration.findOne({ userId });
        if (!integration) {
            integration = new TwitterIntegration({ userId });
        }

        integration.apiKey = apiKey;
        integration.apiKeySecret = apiKeySecret;
        integration.accessToken = accessToken;
        integration.accessTokenSecret = accessTokenSecret;
        integration.bearerToken = bearerToken;
        integration.status = 'active';
        integration.lastSync = new Date();
        
        await integration.save();
        return integration;
    } catch (error) {
        console.error('Error setting up Twitter integration:', error);
        throw error;
    }
};

// Test Twitter connection
const testConnection = async (userId) => {
    try {
        const client = await createTwitterClient(userId);
        const headers = {
            'Authorization': `Bearer ${client.bearerToken || client.accessToken}`,
            'Content-Type': 'application/json'
        };
        
        const response = await axios.get(`${TWITTER_BASE_URL}/users/me`, { headers });
        
        const integration = await TwitterIntegration.findOne({ userId });
        integration.status = 'active';
        integration.lastSync = new Date();
        integration.twitterUserId = response.data.data.id;
        integration.screenName = response.data.data.username;
        await integration.save();

        return { success: true, data: response.data };
    } catch (error) {
        console.error('Error testing Twitter connection:', error);
        const integration = await TwitterIntegration.findOne({ userId });
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
        const client = await createTwitterClient(userId);
        const headers = {
            'Authorization': `Bearer ${client.bearerToken || client.accessToken}`,
            'Content-Type': 'application/json'
        };
        
        const response = await axios.get(`${TWITTER_BASE_URL}/users/me`, {
            headers,
            params: {
                'user.fields': 'created_at,description,entities,id,location,name,pinned_tweet_id,profile_image_url,protected,public_metrics,url,username,verified,withheld'
            }
        });
        return response.data.data;
    } catch (error) {
        console.error('Error getting user profile:', error);
        throw error;
    }
};

// Get User Tweets
const getUserTweets = async (userId, maxResults = 100) => {
    try {
        const client = await createTwitterClient(userId);
        const headers = {
            'Authorization': `Bearer ${client.bearerToken || client.accessToken}`,
            'Content-Type': 'application/json'
        };
        
        const response = await axios.get(`${TWITTER_BASE_URL}/users/${client.twitterUserId}/tweets`, {
            headers,
            params: {
                'max_results': maxResults,
                'tweet.fields': 'created_at,public_metrics,text,entities,referenced_tweets'
            }
        });
        return response.data.data;
    } catch (error) {
        console.error('Error getting user tweets:', error);
        throw error;
    }
};

// Create Tweet
const createTweet = async (userId, text, replyToId = null) => {
    try {
        const client = await createTwitterClient(userId);
        const headers = {
            'Authorization': `Bearer ${client.bearerToken || client.accessToken}`,
            'Content-Type': 'application/json'
        };
        
        const tweetData = { text };
        if (replyToId) {
            (tweetData as any).reply = { in_reply_to_tweet_id: replyToId };
        }

        const response = await axios.post(
            `${TWITTER_BASE_URL}/tweets`,
            tweetData,
            { headers }
        );
        return response.data.data;
    } catch (error) {
        console.error('Error creating tweet:', error);
        throw error;
    }
};

// Delete Tweet
const deleteTweet = async (userId, tweetId) => {
    try {
        const client = await createTwitterClient(userId);
        const headers = {
            'Authorization': `Bearer ${client.bearerToken || client.accessToken}`,
            'Content-Type': 'application/json'
        };
        
        const response = await axios.delete(
            `${TWITTER_BASE_URL}/tweets/${tweetId}`,
            { headers }
        );
        return response.data;
    } catch (error) {
        console.error('Error deleting tweet:', error);
        throw error;
    }
};

// Get Tweet Replies
const getTweetReplies = async (userId, tweetId) => {
    try {
        const client = await createTwitterClient(userId);
        const headers = {
            'Authorization': `Bearer ${client.bearerToken || client.accessToken}`,
            'Content-Type': 'application/json'
        };
        
        const response = await axios.get(`${TWITTER_BASE_URL}/tweets/search/recent`, {
            headers,
            params: {
                'query': `conversation_id:${tweetId}`,
                'tweet.fields': 'created_at,public_metrics,text,entities,referenced_tweets',
                'expansions': 'author_id',
                'user.fields': 'username,name,profile_image_url'
            }
        });
        return response.data.data;
    } catch (error) {
        console.error('Error getting tweet replies:', error);
        throw error;
    }
};

// Like Tweet
const likeTweet = async (userId, tweetId) => {
    try {
        const client = await createTwitterClient(userId);
        const headers = {
            'Authorization': `Bearer ${client.bearerToken || client.accessToken}`,
            'Content-Type': 'application/json'
        };
        
        const response = await axios.post(
            `${TWITTER_BASE_URL}/users/${client.twitterUserId}/likes`,
            { tweet_id: tweetId },
            { headers }
        );
        return response.data.data;
    } catch (error) {
        console.error('Error liking tweet:', error);
        throw error;
    }
};

// Unlike Tweet
const unlikeTweet = async (userId, tweetId) => {
    try {
        const client = await createTwitterClient(userId);
        const headers = {
            'Authorization': `Bearer ${client.bearerToken || client.accessToken}`,
            'Content-Type': 'application/json'
        };
        
        const response = await axios.delete(
            `${TWITTER_BASE_URL}/users/${client.twitterUserId}/likes/${tweetId}`,
            { headers }
        );
        return response.data.data;
    } catch (error) {
        console.error('Error unliking tweet:', error);
        throw error;
    }
};

// Retweet
const retweet = async (userId, tweetId) => {
    try {
        const client = await createTwitterClient(userId);
        const headers = {
            'Authorization': `Bearer ${client.bearerToken || client.accessToken}`,
            'Content-Type': 'application/json'
        };
        
        const response = await axios.post(
            `${TWITTER_BASE_URL}/users/${client.twitterUserId}/retweets`,
            { tweet_id: tweetId },
            { headers }
        );
        return response.data.data;
    } catch (error) {
        console.error('Error retweeting:', error);
        throw error;
    }
};

// Undo Retweet
const undoRetweet = async (userId, tweetId) => {
    try {
        const client = await createTwitterClient(userId);
        const headers = {
            'Authorization': `Bearer ${client.bearerToken || client.accessToken}`,
            'Content-Type': 'application/json'
        };
        
        const response = await axios.delete(
            `${TWITTER_BASE_URL}/users/${client.twitterUserId}/retweets/${tweetId}`,
            { headers }
        );
        return response.data.data;
    } catch (error) {
        console.error('Error undoing retweet:', error);
        throw error;
    }
};

// Disconnect Twitter integration
const disconnectTwitter = async (userId) => {
    try {
        const integration = await TwitterIntegration.findOne({ userId });
        if (!integration) {
            throw new Error('Twitter integration not found');
        }

        integration.status = 'disconnected';
        integration.accessToken = null;
        integration.accessTokenSecret = null;
        integration.apiKey = null;
        integration.apiKeySecret = null;
        integration.bearerToken = null;
        integration.lastSync = new Date();
        
        await integration.save();
        return integration;
    } catch (error) {
        console.error('Error disconnecting Twitter:', error);
        throw error;
    }
};

// Get Twitter integration status
const getTwitterStatus = async (userId) => {
    try {
        const integration = await TwitterIntegration.findOne({ userId });
        if (!integration) {
            return { status: 'pending' };
        }
        return {
            status: integration.status,
            lastSync: integration.lastSync,
            error: integration.error,
            screenName: integration.screenName
        };
    } catch (error) {
        console.error('Error getting Twitter status:', error);
        throw error;
    }
};

export default { 
    setupTwitter,
    testConnection,
    getUserProfile,
    getUserTweets,
    createTweet,
    deleteTweet,
    getTweetReplies,
    likeTweet,
    unlikeTweet,
    retweet,
    undoRetweet,
    disconnectTwitter,
    getTwitterStatus
 }; 