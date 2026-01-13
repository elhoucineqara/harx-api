import express from 'express';
const router = express.Router();
import JiraIntegration from '../models/JiraIntegration';    
const {
    setupJira,
    testConnection,
    getCurrentUser,
    getProjects,
    getProject,
    searchIssues,
    getIssue,
    createIssue,
    updateIssue,
    addComment,
    getTransitions,
    transitionIssue,
    getBoards,
    getSprints,
    disconnectJira,
    getJiraStatus
} = require('../../services/jiraService');

// ✅ Setup Jira Integration
router.post('/setup', async (req, res) => {
    const { userId, host, email, apiToken, projectKey } = req.body;

    if (!userId || !host || !email || !apiToken) {
        return res.status(400).json({ 
            success: false, 
            error: 'Missing required fields. Please provide userId, host, email, and apiToken.' 
        });
    }

    try {
        const integration = await setupJira(userId, host, email, apiToken, projectKey);
        res.json({ 
            success: true, 
            message: 'Jira integration setup successfully!', 
            data: {
                status: integration.status,
                host: integration.host,
                email: integration.email,
                projectKey: integration.projectKey
            }
        });
    } catch (error) {
        console.error('❌ Error setting up Jira integration:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to setup Jira integration', 
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
        console.error('❌ Error testing Jira connection:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to test Jira connection', 
            message: error.message 
        });
    }
});

// ✅ Get Current User
router.get('/current-user', async (req, res) => {
    const { userId } = req.query;

    if (!userId) {
        return res.status(400).json({ success: false, error: 'User ID is required' });
    }

    try {
        const user = await getCurrentUser(userId);
        res.json({ success: true, user });
    } catch (error) {
        console.error('❌ Error getting current user:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to get current user', 
            message: error.message 
        });
    }
});

// ✅ Get Projects
router.get('/projects', async (req, res) => {
    const { userId } = req.query;

    if (!userId) {
        return res.status(400).json({ success: false, error: 'User ID is required' });
    }

    try {
        const projects = await getProjects(userId);
        res.json({ success: true, projects });
    } catch (error) {
        console.error('❌ Error getting projects:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to get projects', 
            message: error.message 
        });
    }
});

// ✅ Get Project
router.get('/project/:projectIdOrKey', async (req, res) => {
    const { userId } = req.query;
    const { projectIdOrKey } = req.params;

    if (!userId || !projectIdOrKey) {
        return res.status(400).json({ 
            success: false, 
            error: 'Missing required fields. Please provide userId and projectIdOrKey.' 
        });
    }

    try {
        const project = await getProject(userId, projectIdOrKey);
        res.json({ success: true, project });
    } catch (error) {
        console.error('❌ Error getting project:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to get project', 
            message: error.message 
        });
    }
});

// ✅ Search Issues
router.get('/search', async (req, res) => {
    const { userId, jql, startAt, maxResults, fields } = req.query;

    if (!userId || !jql) {
        return res.status(400).json({ 
            success: false, 
            error: 'Missing required fields. Please provide userId and jql.' 
        });
    }

    try {
        const startAtNum = startAt && typeof startAt === 'string' ? parseInt(startAt) : 0;
        const maxResultsNum = maxResults && typeof maxResults === 'string' ? parseInt(maxResults) : 50;
        const fieldsArray = fields && typeof fields === 'string' ? fields.split(',') : ['summary', 'status', 'assignee'];
        
        const issues = await searchIssues(userId as string, jql as string, startAtNum, maxResultsNum, fieldsArray);
        res.json({ success: true, ...issues });
    } catch (error) {
        console.error('❌ Error searching issues:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to search issues', 
            message: error.message 
        });
    }
});

// ✅ Get Issue
router.get('/issue/:issueIdOrKey', async (req, res) => {
    const { userId } = req.query;
    const { issueIdOrKey } = req.params;

    if (!userId || !issueIdOrKey) {
        return res.status(400).json({ 
            success: false, 
            error: 'Missing required fields. Please provide userId and issueIdOrKey.' 
        });
    }

    try {
        const issue = await getIssue(userId, issueIdOrKey);
        res.json({ success: true, issue });
    } catch (error) {
        console.error('❌ Error getting issue:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to get issue', 
            message: error.message 
        });
    }
});

// ✅ Create Issue
router.post('/issue', async (req, res) => {
    const { userId, issueData } = req.body;

    if (!userId || !issueData) {
        return res.status(400).json({ 
            success: false, 
            error: 'Missing required fields. Please provide userId and issueData.' 
        });
    }

    try {
        const issue = await createIssue(userId, issueData);
        res.json({ success: true, issue });
    } catch (error) {
        console.error('❌ Error creating issue:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to create issue', 
            message: error.message 
        });
    }
});

// ✅ Update Issue
router.put('/issue/:issueIdOrKey', async (req, res) => {
    const { userId, issueData } = req.body;
    const { issueIdOrKey } = req.params;

    if (!userId || !issueIdOrKey || !issueData) {
        return res.status(400).json({ 
            success: false, 
            error: 'Missing required fields. Please provide userId, issueIdOrKey, and issueData.' 
        });
    }

    try {
        await updateIssue(userId, issueIdOrKey, issueData);
        res.json({ success: true, message: 'Issue updated successfully' });
    } catch (error) {
        console.error('❌ Error updating issue:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to update issue', 
            message: error.message 
        });
    }
});

// ✅ Add Comment
router.post('/issue/:issueIdOrKey/comment', async (req, res) => {
    const { userId, comment } = req.body;
    const { issueIdOrKey } = req.params;

    if (!userId || !issueIdOrKey || !comment) {
        return res.status(400).json({ 
            success: false, 
            error: 'Missing required fields. Please provide userId, issueIdOrKey, and comment.' 
        });
    }

    try {
        const result = await addComment(userId, issueIdOrKey, comment);
        res.json({ success: true, comment: result });
    } catch (error) {
        console.error('❌ Error adding comment:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to add comment', 
            message: error.message 
        });
    }
});

// ✅ Get Transitions
router.get('/issue/:issueIdOrKey/transitions', async (req, res) => {
    const { userId } = req.query;
    const { issueIdOrKey } = req.params;

    if (!userId || !issueIdOrKey) {
        return res.status(400).json({ 
            success: false, 
            error: 'Missing required fields. Please provide userId and issueIdOrKey.' 
        });
    }

    try {
        const transitions = await getTransitions(userId, issueIdOrKey);
        res.json({ success: true, transitions });
    } catch (error) {
        console.error('❌ Error getting transitions:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to get transitions', 
            message: error.message 
        });
    }
});

// ✅ Transition Issue
router.post('/issue/:issueIdOrKey/transition', async (req, res) => {
    const { userId, transitionId } = req.body;
    const { issueIdOrKey } = req.params;

    if (!userId || !issueIdOrKey || !transitionId) {
        return res.status(400).json({ 
            success: false, 
            error: 'Missing required fields. Please provide userId, issueIdOrKey, and transitionId.' 
        });
    }

    try {
        await transitionIssue(userId, issueIdOrKey, transitionId);
        res.json({ success: true, message: 'Issue transitioned successfully' });
    } catch (error) {
        console.error('❌ Error transitioning issue:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to transition issue', 
            message: error.message 
        });
    }
});

// ✅ Get Boards
router.get('/boards', async (req, res) => {
    const { userId, projectKeyOrId } = req.query;

    if (!userId) {
        return res.status(400).json({ success: false, error: 'User ID is required' });
    }

    try {
        const boards = await getBoards(userId, projectKeyOrId);
        res.json({ success: true, boards });
    } catch (error) {
        console.error('❌ Error getting boards:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to get boards', 
            message: error.message 
        });
    }
});

// ✅ Get Sprints
router.get('/board/:boardId/sprints', async (req, res) => {
    const { userId } = req.query;
    const { boardId } = req.params;

    if (!userId || !boardId) {
        return res.status(400).json({ 
            success: false, 
            error: 'Missing required fields. Please provide userId and boardId.' 
        });
    }

    try {
        const sprints = await getSprints(userId, boardId);
        res.json({ success: true, sprints });
    } catch (error) {
        console.error('❌ Error getting sprints:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to get sprints', 
            message: error.message 
        });
    }
});

// ✅ Disconnect Jira
router.post('/disconnect', async (req, res) => {
    const { userId } = req.body;

    if (!userId) {
        return res.status(400).json({ success: false, error: 'User ID is required' });
    }

    try {
        const integration = await disconnectJira(userId);
        res.json({ 
            success: true, 
            message: 'Jira disconnected successfully!', 
            status: integration.status 
        });
    } catch (error) {
        console.error('❌ Error disconnecting Jira:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to disconnect Jira integration', 
            message: error.message 
        });
    }
});

// ✅ Get Jira Status
router.get('/status', async (req, res) => {
    const { userId } = req.query;

    if (!userId) {
        return res.status(400).json({ success: false, error: 'User ID is required' });
    }

    try {
        const integration = await JiraIntegration.findOne({ userId });
        if (!integration) {
            return res.json({ success: true, status: 'pending' });
        }
        
        const status = await getJiraStatus(userId);
        res.json({ success: true, ...status });
    } catch (error) {
        console.error('❌ Error getting Jira status:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to fetch Jira integration status', 
            message: error.message 
        });
    }
});

export default router; 