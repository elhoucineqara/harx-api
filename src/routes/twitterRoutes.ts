import express from 'express';
const router = express.Router();
const {
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
} = require('../../services/twitterService');

// ✅ Setup Twitter Integration
router.post('/setup', async (req, res) => {
    const { userId, apiKey, apiKeySecret, accessToken, accessTokenSecret, bearerToken } = req.body;

    if (!userId || !apiKey || !apiKeySecret || !accessToken || !accessTokenSecret) {
        return res.status(400).json({ 
            success: false, 
            error: 'Missing required fields. Please provide userId, apiKey, apiKeySecret, accessToken, and accessTokenSecret.' 
        });
    }

    try {
        const integration = await setupTwitter(userId, apiKey, apiKeySecret, accessToken, accessTokenSecret, bearerToken);
        res.json({ 
            success: true, 
            message: 'Twitter integration setup successfully!', 
            data: {
                status: integration.status,
                screenName: integration.screenName
            }
        });
    } catch (error) {
        console.error('❌ Error setting up Twitter integration:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to setup Twitter integration', 
            message: error.message 
        });
    }
});

// ✅ Test Connection
router.post('/test-connection', async (req, res) => {
    const { userId } = req.body;

    if (!userId) {
        return res.status(400).json({ success: false, error: 'User ID is required' });
    }

    try {
        const result = await testConnection(userId);
        res.json(result);
    } catch (error) {
        console.error('❌ Error testing Twitter connection:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to test Twitter connection', 
            message: error.message 
        });
    }
});

// ✅ Get User Profile
router.get('/profile', async (req, res) => {
    const userId = req.query.userId as string;

    if (!userId) {
        return res.status(400).json({ success: false, error: 'User ID is required' });
    }

    try {
        const profile = await getUserProfile(userId);
        res.json({ success: true, profile });
    } catch (error) {
        console.error('❌ Error getting user profile:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to get user profile', 
            message: error.message 
        });
    }
});

// ✅ Get User Tweets
router.get('/tweets', async (req, res) => {
    const userId = req.query.userId as string;
    const maxResults = req.query.maxResults ? parseInt(req.query.maxResults as string) : 100;

    if (!userId) {
        return res.status(400).json({ success: false, error: 'User ID is required' });
    }

    try {
        const tweets = await getUserTweets(userId, maxResults);
        res.json({ success: true, tweets });
    } catch (error) {
        console.error('❌ Error getting user tweets:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to get user tweets', 
            message: error.message 
        });
    }
});

// ✅ Create Tweet
router.post('/tweets', async (req, res) => {
    const { userId, text, replyToId } = req.body;

    if (!userId || !text) {
        return res.status(400).json({ 
            success: false, 
            error: 'Missing required fields. Please provide userId and text.' 
        });
    }

    try {
        const tweet = await createTweet(userId, text, replyToId);
        res.json({ success: true, tweet });
    } catch (error) {
        console.error('❌ Error creating tweet:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to create tweet', 
            message: error.message 
        });
    }
});

// ✅ Delete Tweet
router.delete('/tweets/:tweetId', async (req, res) => {
    const userId = req.query.userId as string;
    const { tweetId } = req.params;

    if (!userId || !tweetId) {
        return res.status(400).json({ 
            success: false, 
            error: 'Missing required fields. Please provide userId and tweetId.' 
        });
    }

    try {
        await deleteTweet(userId, tweetId);
        res.json({ success: true, message: 'Tweet deleted successfully' });
    } catch (error) {
        console.error('❌ Error deleting tweet:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to delete tweet', 
            message: error.message 
        });
    }
});

// ✅ Get Tweet Replies
router.get('/tweets/:tweetId/replies', async (req, res) => {
    const userId = req.query.userId as string;
    const { tweetId } = req.params;

    if (!userId || !tweetId) {
        return res.status(400).json({ 
            success: false, 
            error: 'Missing required fields. Please provide userId and tweetId.' 
        });
    }

    try {
        const replies = await getTweetReplies(userId, tweetId);
        res.json({ success: true, replies });
    } catch (error) {
        console.error('❌ Error getting tweet replies:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to get tweet replies', 
            message: error.message 
        });
    }
});

// ✅ Like Tweet
router.post('/tweets/:tweetId/like', async (req, res) => {
    const { userId } = req.body;
    const { tweetId } = req.params;

    if (!userId || !tweetId) {
        return res.status(400).json({ 
            success: false, 
            error: 'Missing required fields. Please provide userId and tweetId.' 
        });
    }

    try {
        const result = await likeTweet(userId, tweetId);
        res.json({ success: true, result });
    } catch (error) {
        console.error('❌ Error liking tweet:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to like tweet', 
            message: error.message 
        });
    }
});

// ✅ Unlike Tweet
router.post('/tweets/:tweetId/unlike', async (req, res) => {
    const { userId } = req.body;
    const { tweetId } = req.params;

    if (!userId || !tweetId) {
        return res.status(400).json({ 
            success: false, 
            error: 'Missing required fields. Please provide userId and tweetId.' 
        });
    }

    try {
        const result = await unlikeTweet(userId, tweetId);
        res.json({ success: true, result });
    } catch (error) {
        console.error('❌ Error unliking tweet:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to unlike tweet', 
            message: error.message 
        });
    }
});

// ✅ Retweet
router.post('/tweets/:tweetId/retweet', async (req, res) => {
    const { userId } = req.body;
    const { tweetId } = req.params;

    if (!userId || !tweetId) {
        return res.status(400).json({ 
            success: false, 
            error: 'Missing required fields. Please provide userId and tweetId.' 
        });
    }

    try {
        const result = await retweet(userId, tweetId);
        res.json({ success: true, result });
    } catch (error) {
        console.error('❌ Error retweeting:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to retweet', 
            message: error.message 
        });
    }
});

// ✅ Undo Retweet
router.post('/tweets/:tweetId/unretweet', async (req, res) => {
    const { userId } = req.body;
    const { tweetId } = req.params;

    if (!userId || !tweetId) {
        return res.status(400).json({ 
            success: false, 
            error: 'Missing required fields. Please provide userId and tweetId.' 
        });
    }

    try {
        const result = await undoRetweet(userId, tweetId);
        res.json({ success: true, result });
    } catch (error) {
        console.error('❌ Error undoing retweet:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to undo retweet', 
            message: error.message 
        });
    }
});

// ✅ Disconnect Twitter
router.post('/disconnect', async (req, res) => {
    const { userId } = req.body;

    if (!userId) {
        return res.status(400).json({ success: false, error: 'User ID is required' });
    }

    try {
        const integration = await disconnectTwitter(userId);
        res.json({ 
            success: true, 
            message: 'Twitter disconnected successfully!', 
            status: integration.status 
        });
    } catch (error) {
        console.error('❌ Error disconnecting Twitter:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to disconnect Twitter integration', 
            message: error.message 
        });
    }
});

// ✅ Get Twitter Status
router.get('/status', async (req, res) => {
    const userId = req.query.userId as string;

    if (!userId) {
        return res.status(400).json({ success: false, error: 'User ID is required' });
    }

    try {
        const status = await getTwitterStatus(userId);
        res.json({ success: true, ...status });
    } catch (error) {
        console.error('❌ Error getting Twitter status:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to fetch Twitter integration status', 
            message: error.message 
        });
    }
});

export default router; 