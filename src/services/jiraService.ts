import JiraApi from 'jira-client';
import JiraIntegration from '../models/JiraIntegration';


// Create Jira client
const createJiraClient = async (userId: any) => {
    const integration = await JiraIntegration.findOne({ userId });
    if (!integration) throw new Error('Jira integration not found');

    return new JiraApi({
        protocol: 'https',
        host: integration.host,
        username: integration.email,
        password: integration.apiToken,
        apiVersion: '3',
        strictSSL: true
    });
};

// Setup Jira Integration
const setupJira = async (userId: any, host: string, email: string, apiToken: string, projectKey = null) => {
    let integration = await JiraIntegration.findOne({ userId });

    if (!integration) {
        integration = new JiraIntegration({
            userId,
            host,
            email,
            apiToken,
            projectKey,
            status: 'connected',
            lastConnectionAt: new Date()
        });
    } else {
        integration.host = host;
        integration.email = email;
        integration.apiToken = apiToken;
        if (projectKey) integration.projectKey = projectKey;
        integration.status = 'connected';
        integration.lastConnectionAt = new Date();
    }

    await integration.save();
    return integration;
};

// Test connection to Jira
const testConnection = async (userId) => {
    const integration = await JiraIntegration.findOne({ userId });
    if (!integration) throw new Error('Jira integration not found');

    try {
        const jira = await createJiraClient(userId);
        
        // Test the connection by getting the current user
        await jira.getCurrentUser();
        
        integration.status = 'connected';
        integration.lastConnectionAt = new Date();
        await integration.save();
        
        return { success: true, message: 'Successfully connected to Jira' };
    } catch (error) {
        integration.status = 'failed';
        await integration.save();
        throw error;
    }
};

// Get current user
const getCurrentUser = async (userId) => {
    const jira = await createJiraClient(userId);
    return jira.getCurrentUser();
};

// Get projects
const getProjects = async (userId) => {
    const jira = await createJiraClient(userId);
    return jira.listProjects();
};

// Get project
const getProject = async (userId, projectIdOrKey) => {
    const jira = await createJiraClient(userId);
    return jira.getProject(projectIdOrKey);
};

// Search issues
const searchIssues = async (userId, jql, startAt = 0, maxResults = 50, fields = ['summary', 'status', 'assignee']) => {
    const jira = await createJiraClient(userId);
    return jira.searchJira(jql, {
        startAt,
        maxResults,
        fields
    });
};

// Get issue
const getIssue = async (userId, issueIdOrKey) => {
    const jira = await createJiraClient(userId);
    return jira.findIssue(issueIdOrKey);
};

// Create issue
const createIssue = async (userId, issueData) => {
    const jira = await createJiraClient(userId);
    const integration = await JiraIntegration.findOne({ userId });
    
    // If project key is not provided in issueData but exists in integration, use it
    if (!issueData.fields.project && integration.projectKey) {
        issueData.fields.project = { key: integration.projectKey };
    }
    
    return jira.addNewIssue(issueData);
};

// Update issue
const updateIssue = async (userId, issueIdOrKey, issueData) => {
    const jira = await createJiraClient(userId);
    return jira.updateIssue(issueIdOrKey, issueData);
};

// Add comment to issue
const addComment = async (userId, issueIdOrKey, comment) => {
    const jira = await createJiraClient(userId);
    return jira.addComment(issueIdOrKey, comment);
};

// Get issue transitions
const getTransitions = async (userId, issueIdOrKey) => {
    const jira = await createJiraClient(userId);
    return jira.listTransitions(issueIdOrKey);
};

// Transition issue
const transitionIssue = async (userId, issueIdOrKey, transitionId) => {
    const jira = await createJiraClient(userId);
    return jira.transitionIssue(issueIdOrKey, { transition: { id: transitionId } });
};

// Get boards
const getBoards = async (userId, projectKeyOrId = null) => {
    const jira = await createJiraClient(userId);
    const params = projectKeyOrId ? { projectKeyOrId } : {};
    return jira.getAllBoards(params);
};

// Get sprints
const getSprints = async (userId, boardId) => {
    const jira = await createJiraClient(userId);
    return jira.getAllSprints(boardId);
};

// Disconnect Jira
const disconnectJira = async (userId) => {
    const integration = await JiraIntegration.findOne({ userId });
    if (!integration) throw new Error('Jira integration not found');

    integration.status = 'disconnected';
    await integration.save();
    return integration;
};

// Get Jira Integration Status
const getJiraStatus = async (userId) => {
    const integration = await JiraIntegration.findOne({ userId });
    if (!integration) throw new Error('Jira integration not found');
    
    return {
        status: integration.status,
        lastConnectionAt: integration.lastConnectionAt,
        host: integration.host,
        email: integration.email,
        projectKey: integration.projectKey
    };
};

export default { 
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
 }; 