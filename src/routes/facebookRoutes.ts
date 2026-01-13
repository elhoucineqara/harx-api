import express from 'express';
const router = express.Router();
const {
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
} = require('../../services/facebookService');

// ✅ Setup Facebook Integration
router.post('/setup', async (req, res) => {
    const { userId, accessToken, pageId, pageAccessToken } = req.body;

    if (!userId || !accessToken) {
        return res.status(400).json({ 
            success: false, 
            error: 'Missing required fields. Please provide userId and accessToken.' 
        });
    }

    try {
        const integration = await setupFacebook(userId, accessToken, pageId, pageAccessToken);
        res.json({ 
            success: true, 
            message: 'Facebook integration setup successfully!', 
            data: {
                status: integration.status,
                pageId: integration.pageId
            }
        });
    } catch (error) {
        console.error('❌ Error setting up Facebook integration:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to setup Facebook integration', 
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
        console.error('❌ Error testing Facebook connection:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to test Facebook connection', 
            message: error.message 
        });
    }
});

// ✅ Get Pages
router.get('/pages', async (req, res) => {
    const { userId } = req.query;

    if (!userId) {
        return res.status(400).json({ success: false, error: 'User ID is required' });
    }

    try {
        const pages = await getPages(userId);
        res.json({ success: true, pages });
    } catch (error) {
        console.error('❌ Error getting Facebook pages:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to get Facebook pages', 
            message: error.message 
        });
    }
});

// ✅ Get Page Posts
router.get('/pages/:pageId/posts', async (req, res) => {
    const { userId } = req.query;
    const { pageId } = req.params;

    if (!userId) {
        return res.status(400).json({ success: false, error: 'User ID is required' });
    }

    try {
        const posts = await getPagePosts(userId, pageId);
        res.json({ success: true, posts });
    } catch (error) {
        console.error('❌ Error getting page posts:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to get page posts', 
            message: error.message 
        });
    }
});

// ✅ Create Post
router.post('/pages/:pageId/posts', async (req, res) => {
    const { userId, message, attachments } = req.body;
    const { pageId } = req.params;

    if (!userId || !message) {
        return res.status(400).json({ 
            success: false, 
            error: 'Missing required fields. Please provide userId and message.' 
        });
    }

    try {
        const post = await createPost(userId, message, pageId, attachments);
        res.json({ success: true, post });
    } catch (error) {
        console.error('❌ Error creating post:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to create post', 
            message: error.message 
        });
    }
});

// ✅ Get Post Comments
router.get('/posts/:postId/comments', async (req, res) => {
    const { userId } = req.query;
    const { postId } = req.params;

    if (!userId || !postId) {
        return res.status(400).json({ 
            success: false, 
            error: 'Missing required fields. Please provide userId and postId.' 
        });
    }

    try {
        const comments = await getPostComments(userId, postId);
        res.json({ success: true, comments });
    } catch (error) {
        console.error('❌ Error getting post comments:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to get post comments', 
            message: error.message 
        });
    }
});

// ✅ Reply to Comment
router.post('/comments/:commentId/reply', async (req, res) => {
    const { userId, message } = req.body;
    const { commentId } = req.params;

    if (!userId || !message) {
        return res.status(400).json({ 
            success: false, 
            error: 'Missing required fields. Please provide userId and message.' 
        });
    }

    try {
        const reply = await replyToComment(userId, commentId, message);
        res.json({ success: true, reply });
    } catch (error) {
        console.error('❌ Error replying to comment:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to reply to comment', 
            message: error.message 
        });
    }
});

// ✅ Get Page Insights
router.get('/pages/:pageId/insights', async (req, res) => {
    const { userId } = req.query;
    const { pageId } = req.params;
    const { metrics } = req.query;

    if (!userId) {
        return res.status(400).json({ success: false, error: 'User ID is required' });
    }

    try {
        const insights = await getPageInsights(userId, pageId, metrics ? (metrics as string).split(',') : undefined);
        res.json({ success: true, insights });
    } catch (error) {
        console.error('❌ Error getting page insights:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to get page insights', 
            message: error.message 
        });
    }
});

// ✅ Disconnect Facebook
router.post('/disconnect', async (req, res) => {
    const { userId } = req.body;

    if (!userId) {
        return res.status(400).json({ success: false, error: 'User ID is required' });
    }

    try {
        const integration = await disconnectFacebook(userId);
        res.json({ 
            success: true, 
            message: 'Facebook disconnected successfully!', 
            status: integration.status 
        });
    } catch (error) {
        console.error('❌ Error disconnecting Facebook:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to disconnect Facebook integration', 
            message: error.message 
        });
    }
});

// ✅ Get Facebook Status
router.get('/status', async (req, res) => {
    const { userId } = req.query;

    if (!userId) {
        return res.status(400).json({ success: false, error: 'User ID is required' });
    }

    try {
        const status = await getFacebookStatus(userId);
        res.json({ success: true, ...status });
    } catch (error) {
        console.error('❌ Error getting Facebook status:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to fetch Facebook integration status', 
            message: error.message 
        });
    }
});

export default router; 